
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get Student Profile & Group
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            include: { ProjectGroup: true }
        });

        if (!studentProfile || !studentProfile.groupId) {
            return NextResponse.json([]); // No group/project, so no meetings
        }

        const project = await prisma.project.findUnique({
            where: { groupId: studentProfile.groupId }
        });

        if (!project) {
            return NextResponse.json([]);
        }

        // 2. Fetch Meetings for this Project
        const meetings = await prisma.meeting.findMany({
            where: { projectId: project.id },
            orderBy: { date: 'asc' },
            include: {
                Attendance: {
                    where: { studentId: studentProfile.id }
                }
            }
        });

        return NextResponse.json(meetings.map(m => ({
            id: m.id,
            title: m.title,
            date: m.date,
            location: 'Project Lab', // Default or add to schema if needed
            attendance: m.Attendance[0]?.isPresent ? 'Present' : 'Absent/Pending'
        })));

    } catch (error) {
        console.error("Student Meetings Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
