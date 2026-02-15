import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth";

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
            role: user.FacultyProfile?.designation || user.role, // role here acts as designation
            department: user.FacultyProfile?.department || "N/A",
            status: user.isActive ? "Active" : "Inactive",
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
        const { name, email, department, role = "FACULTY", password, isActive = true } = body;

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password || "password123");

        let userData: any = {
            id: randomUUID(),
            fullName: name,
            email,
            password: hashedPassword,
            isActive: isActive,
            updatedAt: new Date(),
        };

        if (role === 'ADMIN') {
            userData.role = 'ADMIN';
            // Admins don't strictly need a FacultyProfile, but if you want to store department for them, you can.
            // Based on the audit, we want to allow "Pure Admin" without forcing them to be faculty.
            // So we skip FacultyProfile creation for pure admins OR we make it optional.
            // Let's skip it to adhere to "Pure Admin" goal, assuming Admin doesn't need to be assigned projects as a guide.
        } else {
            userData.role = 'FACULTY';
            userData.FacultyProfile = {
                create: {
                    id: randomUUID(),
                    department: department,
                    designation: role, // Mapping role input to designation
                    expertise: []
                }
            };
        }

        const newUser = await prisma.user.create({
            data: userData,
            include: {
                FacultyProfile: true
            }
        });

        return NextResponse.json(newUser);
    } catch (error) {
        console.error("Error creating staff:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 });
    }
}
