import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // Check Access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                guideId: true,
                groupId: true
            }
        });

        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        let hasAccess = false;
        if (payload.role === 'ADMIN') {
            hasAccess = true;
        } else if (payload.role === 'FACULTY') {
            const faculty = await prisma.facultyProfile.findUnique({ where: { userId: payload.sub as string } });
            if (faculty && faculty.id === project.guideId) hasAccess = true;
        } else if (payload.role === 'STUDENT') {
            const student = await prisma.studentProfile.findUnique({ where: { userId: payload.sub as string } });
            if (student && student.groupId === project.groupId) hasAccess = true;
        }

        if (!hasAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const logs = await prisma.activityLog.findMany({
            where: { projectId },
            include: {
                User: {
                    select: { fullName: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(logs);

    } catch (error) {
        console.error("Error fetching activity logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
