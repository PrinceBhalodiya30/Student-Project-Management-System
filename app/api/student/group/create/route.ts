import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        const user = await verifyJWT(token || "");

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { groupName, members } = body; // members array of Student IDs (e.g. STU001)

        // 1. Check if creator has a profile
        const creatorProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.id }
        });

        if (!creatorProfile) {
            return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        }

        // 2. Check if creator is already in a group
        if (creatorProfile.groupId) {
            return NextResponse.json({ error: "You are already in a group" }, { status: 400 });
        }

        // 3. Validate members
        const memberIds = [creatorProfile.id];
        if (members && Array.isArray(members)) {
            for (const idNumber of members) {
                // Find student by ID Number (not User ID, but the display ID like '21IT001')
                const memberProfile = await prisma.studentProfile.findUnique({
                    where: { idNumber } // Assuming idNumber is unique
                });

                if (!memberProfile) {
                    return NextResponse.json({ error: `Student with ID ${idNumber} not found` }, { status: 400 });
                }
                if (memberProfile.groupId) {
                    return NextResponse.json({ error: `Student ${idNumber} is already in a group` }, { status: 400 });
                }
                memberIds.push(memberProfile.id);
            }
        }

        // 4. Create Group
        // Assuming ProjectGroup model exists and has 'name' field
        const group = await prisma.projectGroup.create({
            data: {
                id: randomUUID(),
                name: groupName || `Group-${randomUUID().substring(0, 6)}`,
                // Associate members
                // Usually this is done by updating StudentProfiles to point to this group
                StudentProfile: {
                    connect: memberIds.map(id => ({ id }))
                }
            }
        });

        // 5. Set Leader (Creator)
        // Check if isLeader is a field in StudentProfile or ProjectGroup?
        // In previous files we saw `member.isLeader`, so likely on StudentProfile.
        await prisma.studentProfile.update({
            where: { id: creatorProfile.id },
            data: { isLeader: true }
        });

        return NextResponse.json({ success: true, group });

    } catch (error) {
        console.error("Create Group Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
