import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all projects with their status and relations
export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                ProjectGroup: true,
                FacultyProfile: {
                    include: { User: true } // Get guide's name
                },
                // We might want to include milestones or documents summary later
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

        // Basic validation (In real app, use Zod)
        if (!body.title || !body.description || !body.groupId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newProject = await prisma.project.create({
            data: {
                id: `PRJ-${Date.now()}`, // Simple ID generation
                title: body.title,
                description: body.description,
                type: body.type || "MAJOR",
                status: "PROPOSED",
                groupId: body.groupId,
                updatedAt: new Date(),
            }
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
