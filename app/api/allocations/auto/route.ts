import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        // 1. Get unassigned projects
        const unassignedProjects = await prisma.project.findMany({
            where: { status: "PROPOSED", guideId: null },
            include: { ProjectGroup: true }
        });

        if (unassignedProjects.length === 0) {
            return NextResponse.json({ assignedCount: 0, message: "No projects to assign" });
        }

        // 2. Get available faculty
        // Simple logic: Any faculty with load < maxLoad (assuming maxLoad is 5 for everyone for now)
        // In real app, maxLoad should be in DB. We'll hardcode 5 or check DB if exists.
        // Prisma schema for FacultyProfile doesn't show 'maxLoad', so we assume it.
        // We'll fetch all faculty and count their current projects.
        const faculty = await prisma.facultyProfile.findMany({
            include: {
                Project: true, // to count current load
                User: true
            }
        });

        let assignedCount = 0;
        const updates = [];

        // 3. Simple Round Robin Assignment
        let facultyIndex = 0;

        for (const project of unassignedProjects) {
            // Find next available faculty
            let attempts = 0;
            let assigned = false;

            while (attempts < faculty.length) {
                const guide = faculty[facultyIndex];
                const currentLoad = guide.Project.length; // + any newly assigned in this loop? 
                // We need to track load dynamically in this loop

                if (currentLoad < 5) {
                    // Assign
                    updates.push(prisma.project.update({
                        where: { id: project.id },
                        data: {
                            guideId: guide.id,
                            status: "APPROVED" // Auto-approve when assigned
                        }
                    }));

                    // Update local load count to prevent over-assignment in one batch
                    guide.Project.push({} as any);
                    assignedCount++;
                    assigned = true;
                }

                facultyIndex = (facultyIndex + 1) % faculty.length;
                if (assigned) break;
                attempts++;
            }
        }

        // 4. Execute all updates
        await prisma.$transaction(updates);

        return NextResponse.json({ assignedCount });
    } catch (error) {
        console.error("Auto allocation error:", error);
        return NextResponse.json({ error: "Failed to auto-allocate" }, { status: 500 });
    }
}
