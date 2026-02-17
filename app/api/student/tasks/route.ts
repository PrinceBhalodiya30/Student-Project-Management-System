
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const student = await prisma.studentProfile.findUnique({
            where: { userId: user.id }
        });

        if (!student) {
            return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        }

        const tasks = await prisma.studentTask.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Fetch Tasks Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const student = await prisma.studentProfile.findUnique({
            where: { userId: user.id }
        });

        if (!student) {
            return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        }

        const task = await prisma.studentTask.create({
            data: {
                title,
                studentId: student.id,
                status: 'pending'
            }
        });

        return NextResponse.json(task);

    } catch (error) {
        console.error("Create Task Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
