import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const meetings = await prisma.meeting.findMany({
            include: {
                Project: true,
                Attendance: {
                    include: { Student: { include: { User: true } } }
                }
            },
            orderBy: { date: 'desc' }
        });

        const formatted = meetings.map(m => ({
            id: m.id,
            title: m.title,
            project: m.Project.title,
            projectId: m.projectId,
            date: m.date,
            attendees: m.Attendance.length,
            present: m.Attendance.filter(a => a.isPresent).length,
            attendanceList: m.Attendance.map(a => ({
                id: a.id,
                studentId: a.studentId,
                isPresent: a.isPresent,
                studentName: a.Student?.User?.fullName || a.Student?.idNumber || 'Unknown Student'
            }))
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Meetings GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Find members of the project's group
        const project = await prisma.project.findUnique({
             where: { id: body.projectId },
             include: { ProjectGroup: { include: { StudentProfile: true } } }
        });

        let attendanceData: any[] = [];
        if (project?.ProjectGroup?.StudentProfile) {
            attendanceData = project.ProjectGroup.StudentProfile.map(s => ({
                studentId: s.id,
                isPresent: false
            }));
        }

        const meeting = await prisma.meeting.create({
            data: {
                title: body.title,
                projectId: body.projectId,
                date: new Date(body.date),
                minutes: body.minutes,
                Attendance: {
                    create: attendanceData
                }
            }
        });
        return NextResponse.json(meeting);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
    }
}
