import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch current academic year
        const currentYear = await prisma.academicYear.findFirst({
            where: { isCurrent: true }
        });

        // Fetch all project milestones to calculate a dynamic timeline
        // If no milestones exist, we use a fallback timeline
        const milestones = await prisma.milestone.findMany({
            orderBy: { deadline: 'asc' }
        });

        let phases: any[] = [];

        if (milestones.length > 0) {
            // Group milestones by title to create global phases
            const globalPhases: Record<string, any> = {};
            milestones.forEach(m => {
                if (!globalPhases[m.title]) {
                    globalPhases[m.title] = {
                        name: m.title,
                        total: 1,
                        completed: m.isCompleted ? 1 : 0,
                        date: m.deadline
                    };
                } else {
                    globalPhases[m.title].total++;
                    if (m.isCompleted) globalPhases[m.title].completed++;
                    // Use earliest deadline
                    if (new Date(m.deadline) < new Date(globalPhases[m.title].date)) {
                        globalPhases[m.title].date = m.deadline;
                    }
                }
            });

            phases = Object.values(globalPhases).map(p => {
                const progress = Math.round((p.completed / p.total) * 100);
                let status = "upcoming";
                if (progress === 100) status = "completed";
                else if (progress > 0 || String(p.date) < new Date().toISOString()) status = "current";

                return {
                    name: p.name,
                    status,
                    progress,
                    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                };
            }).slice(0, 5); // Take top 5
        }

        // Fallback phases if DB is empty or lacks milestones
        if (phases.length === 0) {
            phases = [
                { name: "Project Proposals", status: "completed", date: "Aug 15", progress: 100 },
                { name: "Faculty Allocation", status: "completed", date: "Sep 01", progress: 100 },
                { name: "Mid-Term Review", status: "current", date: "Oct 20", progress: 65 },
                { name: "Final Submission", status: "upcoming", date: "Dec 15", progress: 0 },
                { name: "Viva Voce", status: "upcoming", date: "Jan 10", progress: 0 },
            ];
        }

        return NextResponse.json({
            academicYear: currentYear?.name || "2024-2025",
            semester: "Active",
            phases
        });
    } catch (error) {
        console.error("Calendar Error:", error);
        return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
    }
}
