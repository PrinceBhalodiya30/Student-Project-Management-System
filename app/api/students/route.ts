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
        const hashedPassword = await hashPassword(body.password || "password123");

        // Create User AND StudentProfile
        const newUser = await prisma.user.create({
            data: {
                id: randomUUID(),
                fullName: body.name,
                email: body.email,
                password: hashedPassword,
                role: "STUDENT",
                isActive: body.isActive ?? true,
                updatedAt: new Date(),
                StudentProfile: {
                    create: {
                        id: randomUUID(),
                        idNumber: body.idNumber,
                        department: body.department,
                        batch: body.batch,
                        isLeader: body.isLeader ?? false
                    }
                }
            }
        });
        return NextResponse.json(newUser);
    } catch (error) {
        console.error("Create student error", error);
        return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
    }
}
