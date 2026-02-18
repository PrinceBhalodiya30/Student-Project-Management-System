"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"

export async function getStudentDashboardStats(userId: string) {
    const student = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
            ProjectGroup: {
                include: {
                    Project: {
                        include: {
                            Meeting: true,
                            Milestone: true
                        }
                    }
                }
            },
            StudentTask: true
        }
    })

    if (!student) return null

    const project = student.ProjectGroup?.Project
    const tasks = student.StudentTask
    const pendingTasks = tasks.filter(t => t.status === "pending").length

    // Get upcoming meetings
    const now = new Date()
    type MeetingWithProject = Awaited<ReturnType<typeof prisma.meeting.findMany>>[number]
    let upcomingMeetings: MeetingWithProject[] = []
    if (project) {
        upcomingMeetings = await prisma.meeting.findMany({
            where: {
                projectId: project.id,
                date: { gte: now }
            },
            orderBy: { date: 'asc' },
            take: 3
        })
    }

    return {
        project,
        tasks,
        pendingTasks,
        upcomingMeetings,
        isLeader: student.isLeader,
        groupId: student.groupId
    }
}

export async function createProjectGroup(userId: string, groupName: string) {
    try {
        const student = await prisma.studentProfile.findUnique({ where: { userId } })
        if (!student) throw new Error("Student not found")
        if (student.groupId) throw new Error("Already in a group")

        const existingGroup = await prisma.projectGroup.findFirst({ where: { name: groupName } })
        if (existingGroup) throw new Error("Group name already taken")

        const group = await prisma.projectGroup.create({
            data: {
                id: crypto.randomUUID(),
                name: groupName,
                StudentProfile: {
                    connect: { id: student.id }
                }
            }
        })

        // Mark as leader
        await prisma.studentProfile.update({
            where: { id: student.id },
            data: { isLeader: true }
        })

        revalidatePath("/dashboard/student")
        return { success: true, groupId: group.id }
    } catch (error) {
        console.error("Failed to create group:", error)
        return { success: false, error: (error as Error).message }
    }
}

export async function addMemberToGroup(leaderUserId: string, memberIdNumber: string) {
    try {
        // Verify leader
        const leader = await prisma.studentProfile.findUnique({
            where: { userId: leaderUserId },
            include: { ProjectGroup: true }
        })

        if (!leader || !leader.isLeader || !leader.groupId) {
            throw new Error("Unauthorized: Only group leader can add members")
        }

        const groupMemberCount = await prisma.studentProfile.count({
            where: { groupId: leader.groupId }
        })

        if (groupMemberCount >= 4) {
            throw new Error("Group is full (Max 4 members)")
        }

        // Find member
        const member = await prisma.studentProfile.findUnique({
            where: { idNumber: memberIdNumber }
        })

        if (!member) throw new Error("Student not found with this ID")
        if (member.groupId) throw new Error("Student is already in a group")

        // Add to group
        await prisma.studentProfile.update({
            where: { id: member.id },
            data: { groupId: leader.groupId }
        })

        revalidatePath("/dashboard/student/group")
        return { success: true }
    } catch (error) {
        return { success: false, error: (error as Error).message }
    }
}

export async function submitProjectProposal(userId: string, data: { title: string, description: string, typeId: string }) {
    try {
        const student = await prisma.studentProfile.findUnique({ where: { userId } })
        if (!student?.groupId) throw new Error("No group found")

        const existingProject = await prisma.project.findUnique({ where: { groupId: student.groupId } })
        if (existingProject) throw new Error("Project already submitted")

        await prisma.project.create({
            data: {
                groupId: student.groupId,
                title: data.title,
                description: data.description,
                typeId: data.typeId,
                status: "PROPOSED"
            }
        })

        revalidatePath("/dashboard/student")
        return { success: true }
    } catch (error) {
        return { success: false, error: (error as Error).message }
    }
}

export async function uploadDocument(userId: string, projectId: string, name: string, url: string, type: string) {
    try {
        // Verify student belongs to project
        const student = await prisma.studentProfile.findUnique({
            where: { userId },
            include: { ProjectGroup: { include: { Project: true } } }
        })

        if (!student?.ProjectGroup?.Project || student.ProjectGroup.Project.id !== projectId) {
            throw new Error("Unauthorized")
        }

        await prisma.document.create({
            data: {
                id: crypto.randomUUID(),
                projectId,
                name,
                url,
                type
            }
        })
        revalidatePath("/dashboard/student/project")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to upload document" }
    }
}

export async function uploadProjectFile(userId: string, projectId: string, formData: FormData) {
    try {
        const file = formData.get("file") as File
        const name = formData.get("name") as string
        const type = formData.get("type") as string

        if (!file) throw new Error("No file uploaded")

        // Verify student belongs to project
        const student = await prisma.studentProfile.findUnique({
            where: { userId },
            include: { ProjectGroup: { include: { Project: true } } }
        })

        if (!student?.ProjectGroup?.Project || student.ProjectGroup.Project.id !== projectId) {
            throw new Error("Unauthorized")
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename to prevent collisions including original extension
        const originalName = file.name
        const extension = originalName.split('.').pop()
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const filename = `${uniqueSuffix}.${extension}`

        const uploadDir = join(process.cwd(), "public", "uploads")
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        const url = `/uploads/${filename}`

        await prisma.document.create({
            data: {
                id: crypto.randomUUID(),
                projectId,
                name: name || originalName,
                url,
                type
            }
        })

        revalidatePath("/dashboard/student/project")
        return { success: true }
    } catch (error) {
        console.error("Upload error:", error)
        return { success: false, error: "Failed to upload file" }
    }
}

export async function deleteProjectFile(userId: string, documentId: string) {
    try {
        // Verify student belongs to project and has permission
        const student = await prisma.studentProfile.findUnique({
            where: { userId },
            include: { ProjectGroup: { include: { Project: true } } }
        })

        if (!student?.ProjectGroup?.Project) {
            throw new Error("Unauthorized")
        }

        const document = await prisma.document.findUnique({
            where: { id: documentId }
        })

        if (!document) throw new Error("Document not found")

        if (document.projectId !== student.ProjectGroup.Project.id) {
            throw new Error("Unauthorized access to this document")
        }

        // Delete from filesystem
        const filename = document.url.split('/').pop()
        if (filename) {
            const filepath = join(process.cwd(), "public", "uploads", filename)
            try {
                await unlink(filepath)
            } catch (fsError) {
                console.warn("File system delete failed (might be already gone):", fsError)
            }
        }

        // Delete from database
        await prisma.document.delete({
            where: { id: documentId }
        })

        revalidatePath("/dashboard/student/project")
        return { success: true }
    } catch (error) {
        console.error("Delete error:", error)
        return { success: false, error: "Failed to delete file" }
    }
}

export async function getProjectTypes() {
    return await prisma.projectType.findMany()
}

export async function createTask(userId: string, title: string) {
    try {
        const student = await prisma.studentProfile.findUnique({ where: { userId } })
        if (!student) throw new Error("Student not found")

        await prisma.studentTask.create({
            data: {
                studentId: student.id,
                title,
                status: "pending"
            }
        })
        revalidatePath("/dashboard/student")
        revalidatePath("/dashboard/student/tasks")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create task" }
    }
}

export async function updateTaskStatus(taskId: string, status: string) {
    try {
        await prisma.studentTask.update({
            where: { id: taskId },
            data: { status }
        })
        revalidatePath("/dashboard/student")
        revalidatePath("/dashboard/student/tasks")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update task" }
    }
}

export async function deleteTask(taskId: string) {
    try {
        await prisma.studentTask.delete({
            where: { id: taskId }
        })
        revalidatePath("/dashboard/student")
        revalidatePath("/dashboard/student/tasks")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete task" }
    }
}

export async function getStudentTasks(userId: string) {
    const student = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
            StudentTask: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })
    return student?.StudentTask || []
}
