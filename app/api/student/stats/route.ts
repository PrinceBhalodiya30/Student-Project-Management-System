
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get Student Profile to find their Group
        // Use findFirst since userId is unique
        const fullProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            include: {
                ProjectGroup: {
                    include: {
                        Project: {
                            include: {
                                Milestone: true,
                                FacultyProfile: { include: { User: true } }
                            }
                        },
                        StudentProfile: { include: { User: true } }
                    }
                }
            }
        });

        if (!fullProfile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const group = fullProfile.ProjectGroup;
        const project = group?.Project?.[0]; // Assuming group has one project or mapping 

        // Stats
        let completedMilestones = 0;
        let totalMilestones = 0;
        let upcomingDeadlines: any[] = [];
        let projectStatus = "Not Started";
        let guideName = "Not Assigned";

        if (project) {
            projectStatus = project.status;
            totalMilestones = project.Milestone.length;
            completedMilestones = project.Milestone.filter(m => m.isCompleted).length;
            upcomingDeadlines = project.Milestone
                .filter(m => !m.isCompleted && new Date(m.deadline) > new Date())
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                .slice(0, 3);

            if (project.FacultyProfile?.User) {
                guideName = project.FacultyProfile.User.fullName;
            }
        }

        // Recent Notifications (Mock for now or fetch from Notification table if exists)

        return NextResponse.json({
            user: { name: user.name, email: user.email }, // verifyJWT returns payload with name/email
            project: {
                title: project?.title || "No Project Assigned",
                status: projectStatus,
                progress: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
                guide: guideName,
                id: project?.id
            },
            milestones: {
                total: totalMilestones,
                completed: completedMilestones,
                upcoming: upcomingDeadlines
            },
            activity: [] // Empty for now
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
