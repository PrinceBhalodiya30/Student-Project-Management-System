import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, message, audience } = await req.json();

        if (!title || !message || !audience) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let userIds: string[] = [];

        if (audience === "ALL" || audience === "STUDENTS") {
            const students = await prisma.user.findMany({ 
                where: { role: "STUDENT", isActive: true }, 
                select: { id: true } 
            });
            userIds = [...userIds, ...students.map(s => s.id)];
        }

        if (audience === "ALL" || audience === "FACULTY") {
            const faculty = await prisma.user.findMany({ 
                where: { role: "FACULTY", isActive: true }, 
                select: { id: true } 
            });
            userIds = [...userIds, ...faculty.map(f => f.id)];
        }

        if (userIds.length > 0) {
            await prisma.notification.createMany({
                data: userIds.map((id) => ({
                    id: randomUUID(),
                    userId: id,
                    title: `📢 ${title}`,
                    message
                }))
            });
        }

        return NextResponse.json({ success: true, count: userIds.length });
    } catch (error) {
        console.error("Broadcast Error:", error);
        return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
    }
}
