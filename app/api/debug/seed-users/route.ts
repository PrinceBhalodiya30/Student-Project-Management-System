import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
    try {
        const hashedPassword = await hashPassword("password123");

        // Create Admin
        const adminEmail = "admin@spms.edu";
        const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: { password: hashedPassword },
            create: {
                id: "usr_admin_001",
                email: adminEmail,
                password: hashedPassword,
                fullName: "System Administrator",
                role: "ADMIN",
                updatedAt: new Date(),
            }
        });

        // Create Faculty
        const facultyEmail = "faculty@spms.edu";
        const faculty = await prisma.user.upsert({
            where: { email: facultyEmail },
            update: { password: hashedPassword },
            create: {
                id: "usr_faculty_001",
                email: facultyEmail,
                password: hashedPassword,
                fullName: "Dr. Jane Doe",
                role: "FACULTY",
                updatedAt: new Date(),
                FacultyProfile: {
                    create: {
                        id: "fac_001",
                        department: "CS",
                        designation: "Professor",
                        expertise: ["AI", "Security"]
                    }
                }
            }
        });

        // Create Student
        const studentEmail = "student@spms.edu";
        const student = await prisma.user.upsert({
            where: { email: studentEmail },
            update: { password: hashedPassword },
            create: {
                id: "usr_student_001",
                email: studentEmail,
                password: hashedPassword,
                fullName: "John Student",
                role: "STUDENT",
                updatedAt: new Date(),
                StudentProfile: {
                    create: {
                        id: "stu_001",
                        idNumber: "S12345",
                        department: "CS",
                        batch: "2024"
                    }
                }
            }
        });

        return NextResponse.json({
            message: "Users seeded/updated",
            users: [
                { email: admin.email, password: "password123", role: admin.role },
                { email: faculty.email, password: "password123", role: faculty.role },
                { email: student.email, password: "password123", role: student.role }
            ]
        });
    } catch (error) {
        console.error("Seed users error", error);
        return NextResponse.json({ error: "Failed to seed users" }, { status: 500 });
    }
}
