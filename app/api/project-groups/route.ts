import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function GET() {
    try {
        const groups = await prisma.projectGroup.findMany({
            include: {
                Project: {
                    include: { Type: true }
                },
                StudentProfile: {
                    include: { User: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = groups.map(g => ({
            id: g.id,
            name: g.name,
            projectName: g.Project?.title || "No Project",
            members: g.StudentProfile.map(s => s.User.fullName).join(", "),
            memberCount: g.StudentProfile.length
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Create group
        // Transaction to create group and assign members
        const group = await prisma.$transaction(async (tx) => {
            const newGroup = await tx.projectGroup.create({
                data: {
                    id: randomUUID(),
                    name: body.name,
                }
            });

            if (body.members && Array.isArray(body.members) && body.members.length > 0) {
                await tx.studentProfile.updateMany({
                    where: { id: { in: body.members } },
                    data: { groupId: newGroup.id }
                });
            }

            return newGroup;
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error("Group create error", error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}
