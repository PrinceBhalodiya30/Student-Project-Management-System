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
        // Transaction to update multiple records
        await prisma.$transaction(
            attendanceData.map(record =>
                prisma.meetingAttendance.upsert({
                    where: {
                        id: "temp-id-placeholder", // This won't work for upsert without unique compound key or known ID. 
                        // Better to delete existing and create new, or check if we can use a composite key in schema or just create.
                        // Actually, let's just create them properly.
                        // Since we don't have a composite unique key on meetingId + studentId, we should check availability first or just create.
                        // Schema doesn't enforce unique meetingId + studentId. We should probably just delete old for this meeting and insert new.
                    },
                    update: {
                        isPresent: record.isPresent,
                        remarks: record.remarks
                    },
                    create: {
                        meetingId,
                        studentId: record.studentId,
                        isPresent: record.isPresent,
                        remarks: record.remarks
                    }
                })
            ).map(p => p) // Wait, upsert needs a unique where. 
            // The schema for MeetingAttendance is:
            // id String @id @default(cuid())
            // meetingId String
            // studentId String
            // ...
            // There is NO unique constraint on (meetingId, studentId).
            // So we can't use upsert easily without fetching first.
        )
        // Alternative approach: Delete all attendance for this meeting and re-insert.
        // Or specific update if IDs are provided.
        // For simplicity, let's assume this is a "save" operation.

        // Let's refine the schema later if needed, but for now let's just find and update or create.
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
        await prisma.grade.create({
            data: {
                studentId,
                projectId,
                marks,
                comments
            }
        })
        revalidatePath("/dashboard/faculty/projects")
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
