import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        console.log("DEBUG: Starting Seed Process...");

        const projectsToCreate = [
            { id: "PRJ-DEMO-001", title: "AI Powered Allocation System", group: "GRP-001", user: "user1@demo.com", name: "Alice Student" },
            { id: "PRJ-DEMO-002", title: "Smart Campus Navigation", group: "GRP-002", user: "user2@demo.com", name: "Bob Developer" },
            { id: "PRJ-DEMO-003", title: "Blockchain Voting App", group: "GRP-003", user: "user3@demo.com", name: "Charlie Chain" },
            { id: "PRJ-DEMO-004", title: "Student Health Tracker", group: "GRP-004", user: "user4@demo.com", name: "Diana Doctor" },
            { id: "PRJ-DEMO-005", title: "Automated Canteen Ordering", group: "GRP-005", user: "user5@demo.com", name: "Evan Eater" }
        ];

        // Ensure Type exists
        let type = await prisma.projectType.findFirst();
        if (!type) {
            type = await prisma.projectType.create({ data: { name: "MAJOR" } });
        }

        const createdProjects = [];

        for (const p of projectsToCreate) {
            // 1. Create User
            const distinctUser = await prisma.user.upsert({
                where: { email: p.user },
                update: {},
                create: {
                    id: `USR-${p.group}`,
                    email: p.user,
                    password: "password123",
                    fullName: p.name,
                    role: "STUDENT",
                    updatedAt: new Date()
                }
            });

            // 2. Create Group
            const distinctGroup = await prisma.projectGroup.upsert({
                where: { id: p.group },
                update: {},
                create: { id: p.group, name: `${p.name}'s Team` }
            });

            // 3. Link Student to Group
            let sProfile = await prisma.studentProfile.findUnique({ where: { userId: distinctUser.id } });
            if (!sProfile) {
                await prisma.studentProfile.create({
                    data: {
                        id: `STU-${p.group}`,
                        userId: distinctUser.id,
                        idNumber: `ID-${p.group}`,
                        department: "CSE",
                        batch: "2024-25",
                        groupId: distinctGroup.id
                    }
                });
            } else {
                await prisma.studentProfile.update({
                    where: { id: sProfile.id },
                    data: { groupId: distinctGroup.id }
                });
            }

            // 4. Create Project
            const proj = await prisma.project.upsert({
                where: { id: p.id },
                update: {
                    guideId: null, // FORCE NULL
                    status: "PROPOSED",
                    groupId: distinctGroup.id
                },
                create: {
                    id: p.id,
                    title: p.title,
                    description: `A demo project for ${p.title}.`,
                    typeId: type.id,
                    status: "PROPOSED",
                    groupId: distinctGroup.id,
                    guideId: null,
                    updatedAt: new Date()
                }
            });
            createdProjects.push(proj);
        }

        return NextResponse.json({
            message: "Seeding complete",
            projects: createdProjects,
            count: createdProjects.length
        });

    } catch (error) {
        console.error("Seed error", error);
        return NextResponse.json({ error: "Failed to seed: " + error }, { status: 500 });
    }
}
