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

        const fullProfile = await prisma.studentProfile.findFirst({
            where: { userId: user.id },
            include: {
                ProjectGroup: {
                    include: {
                        Project: {
                            include: {
                                Milestone: true,
                                FacultyProfile: { include: { User: true } },
                                Document: true
                            }
                        },
                        StudentProfile: { include: { User: true } }
                    }
                }
            }
        });

        if (!fullProfile || !fullProfile.ProjectGroup || !fullProfile.ProjectGroup.Project?.[0]) {
            return NextResponse.json({ message: "No project found" }, { status: 404 });
        }

        const project = fullProfile.ProjectGroup.Project[0];
        const group = fullProfile.ProjectGroup;

        return NextResponse.json({
            project: {
                ...project,
                milestones: project.Milestone, // Map for frontend compatibility if needed, or update frontend to use capitalized
                documents: project.Document,
                guide: project.FacultyProfile
            },
            group,
            members: group.StudentProfile.map(m => ({
                id: m.userId,
                name: m.User.fullName,
                email: m.User.email,
                isLeader: m.isLeader,
                idNumber: m.idNumber
            }))
        });

    } catch (error) {
        console.error("Student Project API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
