import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, slug, startDate, endDate, isCurrent } = body;

        // Transaction to ensure only one current year if isCurrent is true
        if (isCurrent) {
            await prisma.academicYear.updateMany({
                where: { isCurrent: true, id: { not: id } }, // Set others to false
                data: { isCurrent: false }
            });
        }

        const year = await prisma.academicYear.update({
            where: { id },
            data: {
                name,
                slug,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isCurrent: isCurrent
            }
        });

        return NextResponse.json(year);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update academic year" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.academicYear.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Academic year deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete academic year" }, { status: 500 });
    }
}
