import { Sidebar } from "@/components/dashboard/sidebar"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BackgroundElements } from "@/components/dashboard/background-elements"

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
        if (payload?.sub) {
            user = await prisma.user.findUnique({
                where: { id: payload.sub as string },
                select: {
                    fullName: true,
                    email: true,
                    role: true
                }
            })
        }
    }

    return (
        <div className="flex h-screen w-full bg-background text-foreground relative overflow-hidden">
            <BackgroundElements />
            <Sidebar user={user} />
            <main className="flex-1 relative z-10 overflow-y-auto h-full w-full">
                {children}
            </main>
        </div>
    )
}
