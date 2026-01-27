
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, date, projectId } = body;

        const meeting = await prisma.meeting.update({
            where: { id },
            data: {
                title,
                date: new Date(date),
                projectId // Assumes re-assigning project is allowed
            }
        });

        return NextResponse.json(meeting);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.meeting.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Meeting deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
    }
}
