import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // Fetch project to check ownership (if faculty)
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { FacultyProfile: true }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Authorization Check
        if (payload.role === 'ADMIN') {
            // Admin can approve anything
        } else if (payload.role === 'FACULTY') {
            // Faculty can only approve if they are the guide
            const facultyProfile = await prisma.facultyProfile.findUnique({
                where: { userId: payload.id as string }
            });

            if (!facultyProfile || project.guideId !== facultyProfile.id) {
                return NextResponse.json({ error: "Forbidden: You are not the guide for this project" }, { status: 403 });
            }
        } else {
            // Students cannot approve
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get status from body (default to IN_PROGRESS if not provided, but frontend sends it)
        const body = await request.json();
        const newStatus = body.status || "IN_PROGRESS";

        // Update project status
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                status: newStatus,
            },
        });

        // Log Activity
        await prisma.activityLog.create({
            data: {
                projectId,
                userId: payload.id as string,
                action: `PROJECT_${newStatus}`,
                details: `Project status updated to ${newStatus}`
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("Error approving project:", error);
        return NextResponse.json(
            { error: "Failed to approve project" },
            { status: 500 }
        );
    }
}
