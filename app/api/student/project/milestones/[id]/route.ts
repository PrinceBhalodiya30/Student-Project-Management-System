import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const milestoneId = params.id;
        const { isCompleted } = await request.json();

        if (typeof isCompleted !== 'boolean') {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const milestone = await prisma.milestone.update({
            where: { id: milestoneId },
            data: { isCompleted }
        });

        // Optional: Create notification for faculty
        // But we need to know who the faculty is.
        // Milestone -> Project -> FacultyProfile (guideId) -> User

        try {
            const project = await prisma.project.findUnique({
                where: { id: milestone.projectId },
                include: { FacultyProfile: true }
            });

            if (project && project.FacultyProfile) {
                await prisma.notification.create({
                    data: {
                        id: crypto.randomUUID(),
                        userId: project.FacultyProfile.userId,
                        title: "Milestone Updated",
                        message: `Milestone "${milestone.title}" has been marked as ${isCompleted ? 'completed' : 'incomplete'} by student.`,
                        isRead: false
                    }
                });
            }
        } catch (notifError) {
            console.error("Failed to create notification", notifError);
            // Don't fail the request if notification fails
        }

        return NextResponse.json(milestone);

    } catch (error) {
        console.error("Error updating milestone:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
