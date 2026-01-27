import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const types = await prisma.projectType.findMany({ orderBy: { name: 'asc' } });
        return NextResponse.json(types);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch project types" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const type = await prisma.projectType.create({
            data: {
                name: body.name,
                description: body.description
            }
        });
        return NextResponse.json(type);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create project type" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...data } = body;
        const type = await prisma.projectType.update({
            where: { id },
            data
        });
        return NextResponse.json(type);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update project type" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.projectType.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
