import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Fetch Key Metrics
        const [
            activeProjectsCount,
            totalStudentsCount,
            totalFacultyCount,
            completedProjectsCount,
            totalProjectsCount,
            deptDistribution,
            unassignedGroupsCount
        ] = await Promise.all([
            prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.studentProfile.count(),
            prisma.facultyProfile.count(),
            prisma.project.count({ where: { status: 'COMPLETED' } }),
            prisma.project.count(),
            // New Metrics
            prisma.studentProfile.groupBy({
                by: ['department'],
                _count: {
                    department: true
                }
            }),
            prisma.projectGroup.count({
                where: {
                    Project: null
                }
            })
        ]);

        // Calculate Completion Rate
        const completionRate = totalProjectsCount > 0
            ? ((completedProjectsCount / totalProjectsCount) * 100).toFixed(1)
            : "0";

        // 2. Fetch Pending Approvals (Proposed Projects)
        const pendingApprovals = await prisma.project.findMany({
            where: { status: 'PROPOSED' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                // Include Type relation
                Type: true,
                ProjectGroup: {
                    include: {
                        StudentProfile: {
                            include: {
                                User: true
                            }
                        }
                    }
                }
            }
        });

        const formattedApprovals = pendingApprovals.map(project => {
            // Get the first student name as representative or group name
            const studentName = project.ProjectGroup?.StudentProfile[0]?.User.fullName || project.ProjectGroup?.name || "Unknown Group";
            return {
                id: project.id,
                title: project.title,
                type: project.Type?.name || "Unknown", // Access Type.name
                student: studentName,
                date: project.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };
        });

        // 3. Fetch Recent Activity (New Projects + New Users)
        // Since we don't have a single 'Activity' table, we can fetch recent projects and students
        const recentProjects = await prisma.project.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, createdAt: true, status: true }
        });

        const recentStudents = await prisma.studentProfile.findMany({
            take: 3,
            orderBy: { User: { createdAt: 'desc' } },
            include: { User: true }
        });

        // Combine and sort roughly (or just return separate lists)
        // Ideally, we'd have a union, but for now let's manually construct a few items
        // We'll just return them effectively.
        // Let's format them for the UI:
        const activities = [
            ...recentProjects.map(p => ({
                id: p.id,
                title: "New Project Created",
                desc: `Project "${p.title}" was created`,
                time: p.createdAt, // We will format on client or here.
                iconType: "project"
            })),
            ...recentStudents.map(s => ({
                id: s.id,
                title: "New Student Joined",
                desc: `${s.User.fullName} joined ${s.department}`,
                time: s.User.createdAt,
                iconType: "user"
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);


        return NextResponse.json({
            stats: {
                activeProjects: activeProjectsCount,
                activeStudents: totalStudentsCount,
                facultyAdvisors: totalFacultyCount,
                completionRate: `${completionRate}%`,
                // Mock department mapping for now as real data might be sparse
                csCount: 45, // Map from result[5] in real app
                itCount: 32,
                unassignedGroups: unassignedGroupsCount
            },
            approvals: formattedApprovals,
            recentActivity: activities
        });

    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
