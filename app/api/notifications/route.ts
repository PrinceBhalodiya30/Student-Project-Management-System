import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const user = await verifyJWT(token || "");

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: user.sub as string },
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
    const token = req.cookies.get("token")?.value;
    const user = await verifyJWT(token || "");

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Mark all as read for simplicity for now, or accept specific IDs
        await prisma.notification.updateMany({
            where: {
                userId: user.sub as string,
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
