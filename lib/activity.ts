import { prisma } from "@/lib/prisma";

export async function logActivity(
    projectId: string,
    userId: string,
    action: string,
    details?: string
) {
    try {
        await prisma.activityLog.create({
            data: {
                projectId,
                userId,
                action,
                details
            }
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // We don't throw here to avoid failing the main action just because logging failed
    }
}
