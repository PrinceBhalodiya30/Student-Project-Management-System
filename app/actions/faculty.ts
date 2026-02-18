"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getFacultyDashboardStats(userId: string) {
    // Get faculty profile
    const faculty = await prisma.facultyProfile.findUnique({
        where: { userId },
        include: {
            Project: {
                include: {
                    Meeting: true
                }
            }
        }
    })

    if (!faculty) return null

    const totalProjects = faculty.Project.length
    const pendingApprovals = faculty.Project.filter(p => p.status === "PROPOSED").length

    // Get upcoming meetings (future dates)
    const now = new Date()
    const upcomingMeetings = await prisma.meeting.findMany({
        where: {
            projectId: {
                in: faculty.Project.map(p => p.id)
            },
            date: {
                gte: now
            }
        },
        orderBy: {
            date: 'asc'
        },
        take: 5,
        include: {
            Project: true
        }
    })

    return {
        totalProjects,
        pendingApprovals,
        upcomingMeetings
    }
}

export async function approveProjectProposal(projectId: string, status: "APPROVED" | "REJECTED") {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { status }
        })
        revalidatePath("/dashboard/faculty")
        return { success: true }
    } catch (error) {
        console.error("Failed to approve project:", error)
        return { success: false, error: "Failed to update project status" }
    }
}

export async function createMeeting(projectId: string, title: string, date: Date) {
    try {
        await prisma.meeting.create({
            data: {
                projectId,
                title,
                date
            }
        })
        revalidatePath("/dashboard/faculty/meetings")
        return { success: true }
    } catch (error) {
        console.error("Failed to create meeting:", error)
        return { success: false, error: "Failed to create meeting" }
    }
}

export async function markAttendance(meetingId: string, attendanceData: { studentId: string, isPresent: boolean, remarks?: string }[]) {
    try {
        // Update or create attendance records
        for (const record of attendanceData) {
            const existing = await prisma.meetingAttendance.findFirst({
                where: {
                    meetingId,
                    studentId: record.studentId
                }
            })

            if (existing) {
                await prisma.meetingAttendance.update({
                    where: { id: existing.id },
                    data: {
                        isPresent: record.isPresent,
                        remarks: record.remarks
                    }
                })
            } else {
                await prisma.meetingAttendance.create({
                    data: {
                        meetingId,
                        studentId: record.studentId,
                        isPresent: record.isPresent,
                        remarks: record.remarks
                    }
                })
            }
        }

        revalidatePath(`/dashboard/faculty/meetings/${meetingId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to mark attendance:", error)
        return { success: false, error: "Failed to mark attendance" }
    }
}

export async function gradeStudent(studentId: string, projectId: string, marks: number, comments?: string) {
    try {
        const existingGrade = await prisma.grade.findFirst({
            where: {
                studentId,
                projectId
            }
        })

        if (existingGrade) {
            await prisma.grade.update({
                where: { id: existingGrade.id },
                data: {
                    marks,
                    comments
                }
            })
        } else {
            await prisma.grade.create({
                data: {
                    studentId,
                    projectId,
                    marks,
                    comments
                }
            })
        }
        revalidatePath("/dashboard/faculty/projects")
        revalidatePath(`/dashboard/faculty/projects/${projectId}/assess`)
        return { success: true }
    } catch (error) {
        console.error("Failed to grade student:", error)
        return { success: false, error: "Failed to grade student" }
    }
}

export async function saveMom(meetingId: string, minutes: string) {
    try {
        await prisma.meeting.update({
            where: { id: meetingId },
            data: { minutes }
        })
        revalidatePath(`/dashboard/faculty/meetings/${meetingId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to save MoM:", error)
        return { success: false, error: "Failed to save MoM" }
    }
}

export async function createMilestone(projectId: string, title: string, deadline: Date) {
    try {
        await prisma.milestone.create({
            data: {
                id: crypto.randomUUID(),
                projectId,
                title,
                deadline,
                isCompleted: false
            }
        })
        revalidatePath(`/dashboard/faculty/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to create milestone:", error)
        return { success: false, error: "Failed to create milestone" }
    }
}
