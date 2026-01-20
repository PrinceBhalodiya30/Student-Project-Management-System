import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Check if group exists
        let group = await prisma.projectGroup.findFirst();

        if (!group) {
            group = await prisma.projectGroup.create({
                data: {
                    id: "GRP-TEST-001",
                    name: "Test Group Alpha"
                }
            });
        }

        return NextResponse.json(group);
    } catch (error) {
        console.error("Seed error", error);
        return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
    }
}
