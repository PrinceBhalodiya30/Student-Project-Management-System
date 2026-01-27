import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        // Simple filters for now (future extension)
        const academicYear = searchParams.get('year');
        const department = searchParams.get('dept');

        // 1. Key Metrics
        const totalProjects = await prisma.project.count();
        const activeStudents = await prisma.studentProfile.count();
        // Mock avg completion time as we don't have 'completionTime' field
        const completedProjects = await prisma.project.count({ where: { status: 'COMPLETED' } });
        const successfulSubmissionsRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

        // 2. Projects by Department
        // Grouping by existing departments in StudentProfile or FacultyProject... 
        // Since Project doesn't directly store department, we might link via Student or Guide.
        // For simplicity, let's assume we count via StudentProfile's department for Major projects.
        // Aggregation in Prisma might need 'groupBy', but for relations it's tricky.
        // Simplified approach: Fetch counts of StudentProfile grouped by Department (Approximation)
        const studentsByDept = await prisma.studentProfile.groupBy({
            by: ['department'],
            _count: {
                id: true
            }
        });

        const deptChartData = studentsByDept.map(d => ({
            name: d.department || "Unknown",
            // Normalize for chart (mock max height logic or raw count)
            count: d._count.id,
            height: '50%' // Dynamic calculation on frontend
        }));

        // 3. Status Distribution
        const statusDistribution = await prisma.project.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        const statusChartData = statusDistribution.map(s => ({
            status: s.status,
            count: s._count.id
        }));

        // 4. Recent Activity (Mocking via recently updated projects)
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
            desc: `Status updated to ${p.status}`,
            date: new Date(p.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        }));

        return NextResponse.json({
            metrics: {
                totalProjects,
                activeStudents,
                avgCompletionTime: "4.2 mos", // Placeholder
                successRate: successfulSubmissionsRate.toFixed(1) + "%"
            },
            charts: {
                byDepartment: deptChartData,
                byStatus: statusChartData
            },
            recentActivity
        });

    } catch (error) {
        console.error("Error fetching report data:", error);
        return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
    }
}
