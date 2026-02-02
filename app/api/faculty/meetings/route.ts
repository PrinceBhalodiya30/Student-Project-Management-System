import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const userId = payload.id as string;
        const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId } });

        if (!facultyProfile) return NextResponse.json([]);

        // Get all projects for this faculty
        const myProjects = await prisma.project.findMany({
            where: { guideId: facultyProfile.id },
            select: { id: true }
        });
        const projectIds = myProjects.map(p => p.id);

        const meetings = await prisma.meeting.findMany({
            where: {
                projectId: { in: projectIds }
            },
            include: {
                Project: { select: { title: true } }
            },
            orderBy: { date: 'asc' }
        });

        return NextResponse.json(meetings);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { projectId, title, date, time } = body;

        // Combine date and time
        const meetingDateTime = new Date(`${date}T${time}`);

        const meeting = await prisma.meeting.create({
            data: {
                projectId,
                title,
                date: meetingDateTime,
            }
        });

        return NextResponse.json(meeting);
    } catch (error) {
        console.error("Create meeting error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
