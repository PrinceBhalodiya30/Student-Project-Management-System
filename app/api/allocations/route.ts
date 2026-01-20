import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch data for allocations screen
export async function GET() {
    try {
        // 1. Fetch Unassigned Projects (Example: Logic for projects without guide)
        const unassignedProjects = await prisma.project.findMany({
            where: {
                guideId: null, // Depending on schema logic
                status: { not: 'REJECTED' }
            },
            include: {
                ProjectGroup: true
            },
            take: 20
        });

        // 2. Fetch Faculty Availability
        // Note: Workload calculation would ideally be a separate aggregate query
        const faculty = await prisma.facultyProfile.findMany({
            include: {
                User: true,
                Project: true // To calculate current load
            }
        });

        // Calculate load derived from active projects
        const facultyWithLoad = faculty.map(f => ({
            id: f.id,
            name: f.User.fullName,
            email: f.User.email,
            department: f.department,
            expertise: f.expertise,
            currentLoad: f.Project.filter(p => p.status === 'IN_PROGRESS').length, // Mock logic
            maxLoad: 5 // Static for now, or could be in DB
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

// POST: Auto-Allocate (Mock Implementation)
export async function POST() {
    // 1. Fetch unassigned
    // 2. Greedy algorithm to match expertise
    // 3. Update DB
    return NextResponse.json({ message: "Auto-allocation triggered" });
}
