import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch data for allocations screen
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'unassigned';

        // Build where clause based on status
        let whereClause: any = {
            status: { not: 'REJECTED' }
        };

        if (status === 'unassigned') {
            whereClause.guideId = null;
        }
        // If status is 'all' or 'assigned', we don't filter by guideId=null (or filter guideId!=null)
        // For now let's just support 'all' for the UI list.

        // 1. Fetch Projects
        const projectsRaw = await prisma.project.findMany({
            where: whereClause,
            include: {
                ProjectGroup: {
                    include: {
                        StudentProfile: { include: { User: true } }
                    }
                },
                Type: true,
                FacultyProfile: { // Include Guide info
                    include: { User: true }
                }
            },
        });

        // 2. Fetch Faculty and Calculate Load
        const faculty = await prisma.facultyProfile.findMany({
            include: {
                User: true,
                Project: true // Include projects to calculate load
            }
        });

        // Transform faculty data with load info
        const maxLoad = 5; // Define maxLoad, or fetch from config if dynamic
        const facultyLoad = faculty.map(f => ({
            id: f.id,
            name: f.User.fullName,
            department: f.department,
            load: f.Project.length,
            maxLoad: maxLoad, // Use dynamic maxLoad
            isOverloaded: f.Project.length >= maxLoad
        })).filter(f => !f.isOverloaded); // Only return available faculty

        const projects = projectsRaw.map(p => {
            const leader = p.ProjectGroup?.StudentProfile?.find(s => s.isLeader) || p.ProjectGroup?.StudentProfile?.[0];
            return {
                id: p.id,
                title: p.title,
                leader: leader?.User.fullName || "Unknown",
                batch: leader?.batch || "N/A",
                dept: leader?.department || "N/A",
                guideId: p.guideId,
                guideName: p.FacultyProfile?.User.fullName || "Unassigned"
            };
        });

        return NextResponse.json({
            projects: projects,
            faculty: facultyLoad
        });

    } catch (error) {
        console.error("Error fetching allocation data:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

// POST: Manual Allocate (Assign/Unassign Guide)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, guideId } = body;

        if (!projectId) {
            return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
        }

        // Prepare update data
        const updateData: any = {};
        if (guideId === null || guideId === "null") {
            updateData.guideId = null; // Unassign
        } else {
            updateData.guideId = guideId; // Assign
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: updateData.guideId ? "Project allocated successfully" : "Project unassigned successfully",
            project: updatedProject
        });

    } catch (error) {
        console.error("Error allocating project:", error);
        return NextResponse.json({ error: "Failed to allocate project" }, { status: 500 });
    }
}
