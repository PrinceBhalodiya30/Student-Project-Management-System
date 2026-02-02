import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, department, role, isActive, password } = body;

        // Prepare update data
        const updateData: any = {
            fullName: name,
            email,
            isActive: isActive !== undefined ? isActive : undefined,
            FacultyProfile: {
                update: {
                    department: department,
                    designation: role
                }
            }
        };

        // If password is provided (limit to non-empty strings), hash and update it
        if (password && password.trim() !== "") {
            updateData.password = await hashPassword(password);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
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
