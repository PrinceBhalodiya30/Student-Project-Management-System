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

        const facultyProfile = await prisma.facultyProfile.findUnique({
            where: { userId }
        });

        if (!facultyProfile) {
            return NextResponse.json([]);
        }

        const projects = await prisma.project.findMany({
            where: {
                guideId: facultyProfile.id
            },
            include: {
                ProjectGroup: {
                    include: {
                        StudentProfile: {
                            include: { User: true }
                        }
                    }
                },
                Type: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(projects);

    } catch (error) {
        console.error("Faculty projects error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
