import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Fetch all projects first to calculate aggregates
        const allProjects = await prisma.project.findMany({
            include: {
                ProjectGroup: {
                    include: {
                        StudentProfile: true
                    }
                }
            }
        });

        // 2. Fetch total active students
        const activeStudents = await prisma.user.count({
            where: {
                role: 'STUDENT',
                isActive: true
            }
        });

        // 3. Calculate Metrics
        const totalProjects = allProjects.length;
        const completedProjects = allProjects.filter(p => p.status === 'COMPLETED');

        // Success Rate
        const successRateVal = totalProjects > 0
            ? Math.round((completedProjects.length / totalProjects) * 100)
            : 0;

        // Avg Completion Time (naive: createdAt to updatedAt for COMPLETED projects)
        let totalDays = 0;
        if (completedProjects.length > 0) {
            completedProjects.forEach(p => {
                const start = new Date(p.createdAt).getTime();
                const end = new Date(p.updatedAt).getTime();
                const diff = end - start;
                totalDays += diff / (1000 * 3600 * 24);
            });
        }
        const avgDays = completedProjects.length > 0 ? (totalDays / completedProjects.length) : 0;
        const avgMonths = (avgDays / 30).toFixed(1);

        // 4. Department Breakdown
        const deptMap: Record<string, number> = {};

        // 4b. Status Breakdown
        const statusMap: Record<string, number> = {};

        allProjects.forEach(p => {
            // Dept
            const students = p.ProjectGroup?.StudentProfile || [];
            if (students.length > 0) {
                const dept = students[0].department || 'Unknown';
                deptMap[dept] = (deptMap[dept] || 0) + 1;
            } else {
                deptMap['Unassigned'] = (deptMap['Unassigned'] || 0) + 1;
            }

            // Status
            const s = p.status || 'UNKNOWN';
            statusMap[s] = (statusMap[s] || 0) + 1;
        });

        const byDepartment = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

        const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
            status,
            count,
            percentage: totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0
        }));

        // 5. Recent Activity (Last 5 updated)
        const recentProjects = await prisma.project.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                status: true,
                updatedAt: true
            }
        });

        const recentActivity = recentProjects.map(p => ({
            id: p.id,
            project: p.title,
            desc: `Project updated to ${p.status}`,
            date: new Date(p.updatedAt).toLocaleDateString()
        }));

        return NextResponse.json({
            metrics: {
                totalProjects,
                activeStudents,
                avgCompletionTime: `${avgMonths} Months`,
                successRate: `${successRateVal}%`
            },
            statusBreakdown,
            charts: {
                byDepartment
            },
            recentActivity
        });

    } catch (error) {
        console.error("Reports API Error:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
