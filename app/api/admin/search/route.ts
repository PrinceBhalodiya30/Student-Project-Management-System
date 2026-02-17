import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ projects: [], staff: [], students: [] });
        }

        // Parallel queries for optimized performance
        const [projects, staff, students] = await Promise.all([
            // Search Projects
            prisma.project.findMany({
                where: {
                    OR: [
                        { title: { contains: query } }, // Add mode: 'insensitive' if valid for your DB provider
                        { id: { contains: query } }
                    ]
                },
                take: 5,
                select: { id: true, title: true, status: true, Type: true }
            }),

            // Search Staff (Faculty/Admin)
            prisma.user.findMany({
                where: {
                    role: { in: ['FACULTY', 'ADMIN'] },
                    OR: [
                        { fullName: { contains: query } },
                        { email: { contains: query } }
                    ]
                },
                take: 5,
                select: { id: true, fullName: true, email: true, role: true, FacultyProfile: { select: { department: true } } }
            }),

            // Search Students
            prisma.user.findMany({
                where: {
                    role: 'STUDENT',
                    OR: [
                        { fullName: { contains: query } },
                        { email: { contains: query } }, // Student ID check is complex via relation in OR, so keeping simple here or nested
                        { StudentProfile: { idNumber: { contains: query } } }
                    ]
                },
                take: 5,
                select: {
                    id: true, fullName: true, email: true,
                    StudentProfile: { select: { idNumber: true, department: true } }
                }
            })
        ]);

        return NextResponse.json({
            projects,
            staff: staff.map(s => ({ ...s, department: s.FacultyProfile?.department })),
            students: students.map(s => ({ ...s, idNumber: s.StudentProfile?.idNumber, department: s.StudentProfile?.department }))
        });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
