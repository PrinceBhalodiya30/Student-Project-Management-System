import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(departments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, code } = body;

        if (!name || !code) {
            return NextResponse.json({ error: "Name and Code are required" }, { status: 400 });
        }

        const department = await prisma.department.create({
            data: { name, code }
        });

        return NextResponse.json(department);
    } catch (error: any) {
        console.error("Department creation error:", error);
        if (error.code === 'P2002') { // Prisma unique constraint violation
            return NextResponse.json({ error: "Department with this name or code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create department: " + error.message }, { status: 500 });
    }
}
