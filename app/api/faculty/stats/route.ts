import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.id as string;

        // Get Faculty Profile
        const facultyProfile = await prisma.facultyProfile.findUnique({
            where: { userId }
        });

        if (!facultyProfile) {
            // Fallback for demo if user is admin but accessing faculty route, or if profile missing
            return NextResponse.json({
                stats: {
                    activeProjects: 0,
                    meetingsToday: 0,
                    pendingReviews: 0,
                    completionRate: 0
                }
            });
        }

        // 1. Asssigned Projects
        const activeProjects = await prisma.project.count({
            where: {
                guideId: facultyProfile.id,
                status: { in: ['IN_PROGRESS', 'APPROVED'] }
            }
        });

        // 2. Pending Reviews (Projects Proposed)
        // Assuming faculty sees proposals assigned to them? Or general proposals?
        // For now, let's say proposals where they are guide
        const pendingReviews = await prisma.project.count({
            where: {
                guideId: facultyProfile.id,
                status: 'PROPOSED'
            }
        });

        // 3. Meetings Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Find projects guided by this faculty
        const myProjects = await prisma.project.findMany({
            where: { guideId: facultyProfile.id },
            select: { id: true }
        });
        const projectIds = myProjects.map(p => p.id);

        const meetingsToday = await prisma.meeting.count({
            where: {
                projectId: { in: projectIds },
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        return NextResponse.json({
            stats: {
                activeProjects,
                meetingsToday,
                pendingReviews,
                completionRate: 0 // Placeholder
            }
        });

    } catch (error) {
        console.error("Faculty stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
