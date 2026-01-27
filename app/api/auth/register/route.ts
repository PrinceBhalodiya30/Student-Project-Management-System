import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, idNumber, department, batch } = body;

        // Basic validation
        if (!name || !email || !password || !idNumber || !department || !batch) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }

        // Check if ID number already exists (in StudentProfile)
        const existingStudent = await prisma.studentProfile.findUnique({
            where: { idNumber }
        });

        if (existingStudent) {
            return NextResponse.json({ error: "Student ID already registered" }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        // Transaction to create User and StudentProfile
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    id: randomUUID(),
                    fullName: name,
                    email,
                    password: hashedPassword,
                    role: "STUDENT",
                    updatedAt: new Date(),
                }
            });

            const studentProfile = await tx.studentProfile.create({
                data: {
                    id: randomUUID(),
                    userId: user.id,
                    idNumber,
                    department,
                    batch,
                }
            });

            return { user, studentProfile };
        });

        return NextResponse.json({
            success: true,
            message: "Student registered successfully",
            userId: result.user.id
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
