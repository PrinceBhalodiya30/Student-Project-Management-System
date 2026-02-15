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
            ...projects.map(p => {
                const members = p.ProjectGroup?.StudentProfile
                    ? p.ProjectGroup.StudentProfile.map(s => s.User.fullName).join(', ')
                    : 'No Members';

                return [
                    p.title || 'Untitled',
                    p.Type?.name || 'Unknown',
                    p.status,
                    p.guideId || 'Unassigned',
                    members,
                    new Date(p.createdAt).toLocaleDateString()
                ];
            })
        ];

        // Add Byte Order Mark (BOM) for Excel compatibility
        const bom = '\uFEFF';
        const csvContent = bom + csvRows.map(row => row.map(cell => {
            // Escape quotes and wrap in quotes
            const stringCell = String(cell || '');
            return `"${stringCell.replace(/"/g, '""')}"`;
        }).join(',')).join('\n');

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
