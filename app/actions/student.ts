"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

export async function uploadDocument(projectId: string, name: string, url: string, type: string) {
    try {
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

export async function getProjectTypes() {
    return await prisma.projectType.findMany()
}
