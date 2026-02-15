import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ projectId: string, milestoneId: string }> }
) {
    try {
        const { projectId, milestoneId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // Authorization Check
        if (payload.role === 'ADMIN') {
            // Admin allowed
        } else if (payload.role === 'FACULTY') {
            // Check if faculty is the guide
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { guideId: true }
            });

            if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

            const facultyProfile = await prisma.facultyProfile.findUnique({
                where: { userId: payload.id as string }
            });

            if (!facultyProfile || project.guideId !== facultyProfile.id) {
                return NextResponse.json({ error: "Forbidden: You are not the guide for this project" }, { status: 403 });
            }
        } else {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { isCompleted } = body;

        const updatedMilestone = await prisma.milestone.update({
            where: { id: milestoneId },
            data: {
                isCompleted: isCompleted
            }
        });

        // Log Activity
        if (isCompleted) {
            await prisma.activityLog.create({
                data: {
                    projectId,
                    userId: payload.id as string,
                    action: "MILESTONE_COMPLETED",
                    details: `Milestone "${updatedMilestone.title}" marked as completed`
                }
            });
        }

        return NextResponse.json(updatedMilestone);

    } catch (error) {
        console.error("Error updating milestone:", error);
        return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
    }
}
