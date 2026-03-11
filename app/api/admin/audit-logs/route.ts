import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const actionFilter = searchParams.get("action");
        const limit = parseInt(searchParams.get("limit") || "50");

        let whereClause = {};
        if (actionFilter && actionFilter !== "ALL") {
            whereClause = { action: actionFilter };
        }

        const logsRaw = await prisma.activityLog.findMany({
            where: whereClause,
            include: {
                User: true,
                Project: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        const logs = logsRaw.map(l => ({
            id: l.id,
            action: l.action,
            details: l.details,
            date: l.createdAt,
            user: l.User?.fullName || "System/Unknown",
            project: l.Project?.title || "Unknown/Deleted Project"
        }));

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Audit Logs Error:", error);
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }
}
