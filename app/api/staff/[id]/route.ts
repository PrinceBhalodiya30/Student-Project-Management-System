import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, department, role } = body;

        // Update User and Faculty Profile
        // Note: id is the User ID
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                fullName: name,
                email,
                FacultyProfile: {
                    update: {
                        department: department,
                        designation: role
                    }
                }
            },
            include: { FacultyProfile: true }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating staff:", error);
        return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.user.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Staff member deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete staff member" }, { status: 500 });
    }
}
