
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Get Student Project
        const student = await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            include: { ProjectGroup: { include: { Project: true } } }
        });

        const project = student?.ProjectGroup?.Project?.[0];

        if (!project) {
            return NextResponse.json({ error: "No project found" }, { status: 404 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create directory
        const relativeUploadDir = `/uploads/projects/${project.id}`;
        const uploadDir = join(cwd(), "public", relativeUploadDir);

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        // Unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // Sanitize
        const finalFilename = `${uniqueSuffix}-${filename}`;
        const filepath = join(uploadDir, finalFilename);

        await writeFile(filepath, buffer);

        // Save to DB
        const fileUrl = `${relativeUploadDir}/${finalFilename}`;

        const doc = await prisma.document.create({
            data: {
                id: randomUUID(),
                projectId: project.id,
                name: file.name,
                url: fileUrl,
                type: file.type || 'application/octet-stream',
            }
        });

        return NextResponse.json(doc);

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
