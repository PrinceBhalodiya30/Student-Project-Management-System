import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'projects') {
        const projects = await prisma.project.findMany({
            include: {
                Type: true,
                ProjectGroup: {
                    include: { StudentProfile: { include: { User: true } } }
                }
            }
        });

        const csvRows = [
            ['Project Title', 'Type', 'Status', 'Guide', 'Group Members', 'Created At'],
            ...projects.map(p => [
                p.title,
                p.Type.name,
                p.status,
                p.guideId || 'Unassigned',
                p.ProjectGroup?.StudentProfile.map(s => s.User.fullName).join(', ') || 'No Members',
                new Date(p.createdAt).toLocaleDateString()
            ])
        ];

        const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="projects-report.csv"'
            }
        });
    }

    if (type === 'students') {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            include: { StudentProfile: true }
        });

        const csvRows = [
            ['Name', 'Email', 'ID Number', 'Department', 'Batch', 'Group ID', 'Active', 'Leader'],
            ...students.map(s => [
                s.fullName,
                s.email,
                s.StudentProfile?.idNumber || '',
                s.StudentProfile?.department || '',
                s.StudentProfile?.batch || '',
                s.StudentProfile?.groupId || '',
                s.isActive ? 'Yes' : 'No',
                s.StudentProfile?.isLeader ? 'Yes' : 'No'
            ])
        ];

        const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="students-report.csv"'
            }
        });
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
}
