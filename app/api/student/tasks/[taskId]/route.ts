
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { status } = await req.json();
        const { taskId } = params;

        // Verify ownership
        const task = await prisma.studentTask.findUnique({
            where: { id: taskId },
            include: { Student: true }
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        if (task.Student.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedTask = await prisma.studentTask.update({
            where: { id: taskId },
            data: { status }
        });

        return NextResponse.json(updatedTask);

    } catch (error) {
        console.error("Update Task Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { taskId: string } }) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { taskId } = params;

        // Verify ownership
        const task = await prisma.studentTask.findUnique({
            where: { id: taskId },
            include: { Student: true }
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        if (task.Student.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.studentTask.delete({
            where: { id: taskId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete Task Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
