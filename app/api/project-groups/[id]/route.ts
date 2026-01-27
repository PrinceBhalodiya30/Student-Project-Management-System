
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, members } = body;

        // Transaction to update group name and members
        const group = await prisma.$transaction(async (tx) => {
            // 1. Update Group Name
            const updatedGroup = await tx.projectGroup.update({
                where: { id },
                data: { name }
            });

            // 2. Update Members (if provided)
            if (members && Array.isArray(members)) {
                // First, remove all members from this group
                await tx.studentProfile.updateMany({
                    where: { groupId: id },
                    data: { groupId: null }
                });

                // Then, add the selected members
                if (members.length > 0) {
                    await tx.studentProfile.updateMany({
                        where: { id: { in: members } },
                        data: { groupId: id }
                    });
                }
            }

            return updatedGroup;
        });

        return NextResponse.json(group);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Disconnect students before deleting group to avoid key constraints if not cascading
        await prisma.studentProfile.updateMany({
            where: { groupId: id },
            data: { groupId: null }
        });

        await prisma.projectGroup.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Group deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete group", details: error }, { status: 500 });
    }
}
