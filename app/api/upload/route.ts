import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, csvData } = body;

        if (!csvData || !type) {
            return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
        }

        const lines = csvData.trim().split('\n');
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const line of lines) {
            const parts = line.split(',').map((p: string) => p.trim());

            // Basic validation
            if (parts.length < 3) {
                results.failed++;
                results.errors.push(`Invalid format: ${line}`);
                continue;
            }

            try {
                const [name, email, department, extra] = parts;

                // Check existing
                const existing = await prisma.user.findUnique({ where: { email } });
                if (existing) {
                    results.failed++;
                    results.errors.push(`Email already exists: ${email}`);
                    continue;
                }

                const hashedPassword = await hashPassword("password123"); // Default password

                if (type === 'student') {
                    // Create Student
                    await prisma.user.create({
                        data: {
                            id: randomUUID(),
                            fullName: name,
                            email: email,
                            password: hashedPassword,
                            role: 'STUDENT',
                            StudentProfile: {
                                create: {
                                    id: randomUUID(),
                                    idNumber: randomUUID().substring(0, 8).toUpperCase(), // Auto-gen ID for now
                                    department: department,
                                    batch: extra || '2024'
                                }
                            }
                        }
                    });
                } else {
                    // Create Faculty
                    await prisma.user.create({
                        data: {
                            id: randomUUID(),
                            fullName: name,
                            email: email,
                            password: hashedPassword,
                            role: 'FACULTY',
                            FacultyProfile: {
                                create: {
                                    id: randomUUID(),
                                    department: department,
                                    designation: extra || 'Lecturer',
                                    expertise: []
                                }
                            }
                        }
                    });
                }
                results.success++;

            } catch (err: any) {
                results.failed++;
                results.errors.push(`Error processing ${line}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${lines.length} records. Success: ${results.success}, Failed: ${results.failed}`,
            details: results.errors
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        return NextResponse.json({ success: false, message: "Server error during upload" }, { status: 500 });
    }
}
