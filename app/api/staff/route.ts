import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all staff (Faculty) for Master Data
export async function GET() {
    try {
        const staff = await prisma.user.findMany({
            where: {
                role: { in: ['FACULTY', 'ADMIN'] }
            },
            include: {
                FacultyProfile: true
            },
            orderBy: {
                fullName: 'asc'
            }
        });

        // Transform to match UI needs
        const formattedStaff = staff.map(user => ({
            id: user.FacultyProfile?.id || user.id, // Use profile ID or User ID
            userId: user.id,
            name: user.fullName,
            email: user.email,
            role: user.FacultyProfile?.designation || user.role,
            department: user.FacultyProfile?.department || "N/A",
            status: "Active", // Mock status as it's not in DB
            initials: user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
        }));

        return NextResponse.json(formattedStaff);
    } catch (error) {
        console.error("Error fetching staff:", error);
        return NextResponse.json({ error: "Failed to fetch staff data" }, { status: 500 });
    }
}

// POST: Add new staff member
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, department, role, password } = body; // Password should be hashed in real app, using plain for now if auth allows or simple hash

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        const newUser = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                fullName: name,
                email,
                password: password || "password123", // Default password
                role: "FACULTY", // Enforce FACULTY role for staff management
                updatedAt: new Date(),
                FacultyProfile: {
                    create: {
                        id: crypto.randomUUID(),
                        department: department,
                        designation: role, // Mapping role input to designation
                        expertise: []
                    }
                }
            },
            include: {
                FacultyProfile: true
            }
        });

        return NextResponse.json(newUser);
    } catch (error) {
        console.error("Error creating staff:", error);
        return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 });
    }
}
