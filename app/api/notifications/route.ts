
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

async function getUserFromRequest(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as { userId: string; role: string };
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to recent 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Mark all as read for simplicity for now, or accept specific IDs
        await prisma.notification.updateMany({
            where: {
                userId: user.userId,
                isRead: false
            },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}
