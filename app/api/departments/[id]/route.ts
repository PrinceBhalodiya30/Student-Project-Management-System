import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, code } = body;

        const department = await prisma.department.update({
            where: { id },
            data: { name, code }
        });

        return NextResponse.json(department);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.department.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Department deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
    }
}
