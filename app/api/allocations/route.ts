import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch data for allocations screen
export async function GET() {
    try {
        // 1. Fetch Unassigned Projects
        const unassignedProjectsRaw = await prisma.project.findMany({
            where: {
                guideId: null,
                status: { not: 'REJECTED' }
            },
            include: {
                ProjectGroup: {
                    include: {
                        StudentProfile: {
                            include: {
                                User: true
                            }
                        }
                    }
                }
            },
            take: 20
        });

        const unassignedProjects = unassignedProjectsRaw.map(p => {
            const leader = p.ProjectGroup?.StudentProfile?.[0]; // Assuming first student is leader or representative
            return {
                id: p.id,
                title: p.title,
                leader: leader?.User.fullName || "Unknown",
                batch: leader?.batch || "N/A",
                dept: leader?.department || "N/A"
            };
        });

        // 2. Fetch Faculty Availability
        const faculty = await prisma.facultyProfile.findMany({
            include: {
                User: true,
                Project: true
            }
        });

        const facultyWithLoad = faculty.map(f => ({
            id: f.id,
            name: f.User.fullName,
            load: f.Project.filter(p => p.status === 'IN_PROGRESS').length,
            maxLoad: 5 // Static for now
        }));

        return NextResponse.json({
            unassignedProjects,
            faculty: facultyWithLoad
        });
    } catch (error) {
        console.error("Error fetching allocations:", error);
        return NextResponse.json({ error: "Failed to fetch allocation data" }, { status: 500 });
    }
}

// POST: Manual Allocate (Assign Guide to Project)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, guideId } = body;

        if (!projectId || !guideId) {
            return NextResponse.json({ error: "Missing projectId or guideId" }, { status: 400 });
        }

        // Check if project exists and is unassigned (optional validation)
        // Check if faculty has capacity (optional validation)

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                guideId: guideId
            }
        });

        return NextResponse.json({
            success: true,
            message: "Project allocated successfully",
            project: updatedProject
        });

    } catch (error) {
        console.error("Error allocating project:", error);
        return NextResponse.json({ error: "Failed to allocate project" }, { status: 500 });
    }
}
