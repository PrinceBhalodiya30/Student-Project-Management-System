import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const years = await prisma.academicYear.findMany({
            orderBy: { startDate: 'desc' }
        });
        return NextResponse.json(years);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch academic years" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, slug, startDate, endDate, isCurrent } = body;

        if (!name || !slug || !startDate || !endDate) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        // Transaction to ensure only one current year if isCurrent is true
        if (isCurrent) {
            await prisma.academicYear.updateMany({
                where: { isCurrent: true },
                data: { isCurrent: false }
            });
        }

        const year = await prisma.academicYear.create({
            data: {
                name,
                slug,
                startDate: start,
                endDate: end,
                isCurrent: isCurrent || false
            }
        });

        return NextResponse.json(year);
    } catch (error: any) {
        console.error("Academic Year creation error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Year with this name or slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create academic year: " + error.message }, { status: 500 });
    }
}
