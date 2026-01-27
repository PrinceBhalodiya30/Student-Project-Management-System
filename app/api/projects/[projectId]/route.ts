import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to get parameters in Next.js 13+ App Router
// The second argument `context` contains params as a Promise
export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                ProjectGroup: {
                    include: {
                        StudentProfile: {
                            include: {
                                User: true
                            }
                        }
                    }
                },
                FacultyProfile: {
                    include: {
                        User: true
                    }
                },
                Milestone: true,
                Document: true
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// UPDATE (PATCH)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const body = await request.json();

        // Prevent updating ID
        delete body.id;

        // If members are provided, update the group members
        if (body.members && Array.isArray(body.members)) {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { groupId: true }
            });

            if (project?.groupId) {
                // Transaction to clear old members and add new ones
                await prisma.$transaction([
                    // 1. Remove all members from this group
                    prisma.studentProfile.updateMany({
                        where: { groupId: project.groupId },
                        data: { groupId: null }
                    }),
                    // 2. Add selected members to this group
                    prisma.studentProfile.updateMany({
                        where: { id: { in: body.members } },
                        data: { groupId: project.groupId }
                    })
                ]);
            }
            delete body.members; // Remove from project update data
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                ...body,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

// DELETE
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;

        await prisma.project.delete({
            where: { id: projectId }
        });

        return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
