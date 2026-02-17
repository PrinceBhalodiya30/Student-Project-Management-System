import { Sidebar } from "@/components/dashboard/sidebar"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    let user = null

    if (token) {
        const payload = await verifyJWT(token)
        if (payload?.id) {
            user = await prisma.user.findUnique({
                where: { id: payload.id as string },
                select: {
                    fullName: true,
                    email: true,
                    role: true
                }
            })
        }
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col">
                {children}
            </div>
        </div>
    )
}
