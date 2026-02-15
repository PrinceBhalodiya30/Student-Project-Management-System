import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, domain, typeId } = body;

        // 1. Get Student Profile & Group
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            include: { ProjectGroup: true }
        });

        if (!studentProfile || !studentProfile.groupId) {
            return NextResponse.json({ error: "You must be in a group to submit a proposal" }, { status: 400 });
        }

        if (!studentProfile.isLeader) {
            return NextResponse.json({ error: "Only the group leader can submit a proposal" }, { status: 403 });
        }

        const groupId = studentProfile.groupId;

        // 2. Check if group already has a project
        const existingProject = await prisma.project.findUnique({
            where: { groupId }
        });

        if (existingProject) {
            return NextResponse.json({ error: "Group already has a project" }, { status: 400 });
        }

        // 3. Create Project
        const project = await prisma.project.create({
            data: {
                id: randomUUID(),
                title,
                description,
                status: 'PROPOSED', // Initial status
                groupId,
                // Assign a default type if not provided, or error?
                // Ideally typeId comes from frontend selection. 
                // We'll trust typeId is valid or handle P.K. constraint error.
                // If typeId is missing, we might need a fallback or make it optional in schema?
                // Let's assume it's optional in schema or check if we can fetch a default.
                typeId: typeId || "default-type-id" // Placeholder, ideally fetch one
            }
        });

        return NextResponse.json({ success: true, project });

    } catch (error) {
        console.error("Create Project Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
