import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth";

export async function GET() {
    try {
        // Fetch users with role STUDENT and their profile
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            include: { StudentProfile: true },
            orderBy: { fullName: 'asc' }
        });

        const formatted = students.map(s => ({
            id: s.StudentProfile?.id,
            userId: s.id,
            name: s.fullName,
            email: s.email,
            idNumber: s.StudentProfile?.idNumber || "N/A",
            department: s.StudentProfile?.department || "N/A",
            batch: s.StudentProfile?.batch || "N/A",
            groupId: s.StudentProfile?.groupId || null,
            isActive: s.isActive,
            isLeader: s.StudentProfile?.isLeader || false
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body.name || !body.email || !body.idNumber || !body.department || !body.batch) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(body.password || "password123");

        // Check for existing user or student profile
        const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }

        const existingStudent = await prisma.studentProfile.findUnique({ where: { idNumber: body.idNumber } });
        if (existingStudent) {
            return NextResponse.json({ error: "ID Number already exists" }, { status: 409 });
        }

        // Create User AND StudentProfile
        const userId = randomUUID();
        const studentProfileId = randomUUID();

        const newUser = await prisma.user.create({
            data: {
                id: userId,
                fullName: body.name,
                email: body.email,
                password: hashedPassword,
                role: "STUDENT",
                isActive: body.isActive ?? true,
                updatedAt: new Date(),
                StudentProfile: {
                    create: {
                        id: studentProfileId,
                        idNumber: body.idNumber,
                        department: body.department,
                        batch: body.batch,
                        isLeader: body.isLeader ?? false
                    }
                }
            }
        });
        return NextResponse.json(newUser);
    } catch (error: any) {
        console.error("Create student error details:", error);
        return NextResponse.json({
            error: "Failed to create student",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
