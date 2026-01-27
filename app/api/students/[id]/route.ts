import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// PUT: Update Student
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // Based on other routes, let's assume we pass User ID or StudentProfile ID. 
        // Best practice: Pass User ID for consistency if possible, or Profile ID.
        // Let's look at `staff` implementation: it expects User ID.
        // Let's stick to User ID for consistency.

        const body = await request.json();
        const { name, email, idNumber, department, batch } = body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                fullName: name,
                email,
                StudentProfile: {
                    update: {
                        idNumber,
                        department,
                        batch
                    }
                }
            },
            include: { StudentProfile: true }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating student:", error);
        return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
    }
}

// DELETE: Remove Student
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.user.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Student deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
    }
}
