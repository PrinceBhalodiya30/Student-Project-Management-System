import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'admin@spms.edu'; // Default to admin for dev/demo

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { fullName: true, email: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { currentEmail, name, email } = body; // currentEmail needed to find user to update

        // In a real app, ID comes from session. Here we rely on passed currentEmail.
        const user = await prisma.user.update({
            where: { email: currentEmail },
            data: {
                fullName: name,
                email: email
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
