import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all projects with their status and relations
export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                ProjectGroup: {
                    include: {
                        StudentProfile: {
                            include: { User: true }
                        }
                    }
                },
                FacultyProfile: {
                    include: { User: true } // Get guide's name
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

// POST: Create a new project proposal
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validations
        if (!body.title || !body.description) {
            return NextResponse.json({ error: "Missing title or description" }, { status: 400 });
        }

        const typeName = body.type || "MAJOR";
        let projectType = await prisma.projectType.findUnique({ where: { name: typeName } });
        if (!projectType) {
            projectType = await prisma.projectType.create({ data: { name: typeName } });
        }

        // Handle Group: Check if groupId provided, else create new group based on Title/Input
        let groupId = body.groupId;
        const groupName = body.groupName || `${body.title} Group`;

        // If no valid groupId (or hardcoded dummy), create a new group
        // In this admin flow, we assume we are creating a project + group shell
        if (!groupId || groupId.length < 10) { // Simple check for dummy/empty
            const newGroup = await prisma.projectGroup.create({
                data: {
                    id: `GRP-${Date.now()}`,
                    name: groupName
                }
            });
            groupId = newGroup.id;
        } else {
            // Verify group exists
            const exists = await prisma.projectGroup.findUnique({ where: { id: groupId } });
            if (!exists) {
                // Fallback create
                const newGroup = await prisma.projectGroup.create({
                    data: {
                        id: `GRP-${Date.now()}`,
                        name: groupName
                    }
                });
                groupId = newGroup.id;
            }
        }

        const newProject = await prisma.project.create({
            data: {
                id: `PRJ-${Date.now()}`,
                title: body.title,
                description: body.description,
                typeId: projectType.id,
                status: "PROPOSED",
                groupId: groupId,
                updatedAt: new Date(),
            }
        });

        // Assign members if provided
        if (body.members && Array.isArray(body.members) && body.members.length > 0) {
            await prisma.studentProfile.updateMany({
                where: { id: { in: body.members } },
                data: { groupId: groupId }
            });
        }

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
