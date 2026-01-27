import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Update project status to IN_PROGRESS
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                status: "IN_PROGRESS",
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("Error approving project:", error);
        return NextResponse.json(
            { error: "Failed to approve project" },
            { status: 500 }
        );
    }
}
