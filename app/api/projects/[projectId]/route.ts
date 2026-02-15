import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

// Helper to get parameters in Next.js 13+ App Router
// The second argument `context` contains params as a Promise
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
                Document: true,
                Type: true
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Access Control
        if (payload.role !== 'ADMIN') {
            let hasAccess = false;

            if (payload.role === 'FACULTY') {
                // Check if faculty is the guide
                const faculty = await prisma.facultyProfile.findUnique({ where: { userId: payload.id as string } });
                if (faculty && faculty.id === project.guideId) {
                    hasAccess = true;
                }
            } else if (payload.role === 'STUDENT') {
                // Check if student is in the group
                const student = await prisma.studentProfile.findUnique({ where: { userId: payload.id as string } });
                if (student && student.groupId === project.groupId) {
                    hasAccess = true;
                }
            }

            if (!hasAccess) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
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

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // Prevent updating ID
        delete body.id;

        // Handle Project Type update (name -> typeId)
        if (body.type) {
            const projectType = await prisma.projectType.findUnique({
                where: { name: body.type }
            });
            if (projectType) {
                body.typeId = projectType.id;
            } else {
                // If type doesn't exist, maybe create it? For now, let's keep it safe and just not update if invalid.
                // Or better, create it if it doesn't exist to match POST behavior.
                const newType = await prisma.projectType.create({ data: { name: body.type } });
                body.typeId = newType.id;
            }
            delete body.type; // Remove 'type' string from body as it's not in Project model
        }

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

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // Only ADMIN can delete
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.project.delete({
            where: { id: projectId }
        });

        return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
