import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { revalidatePath } from "next/cache"
import { Save } from "lucide-react"

async function getProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            FacultyProfile: true
        }
    })
}

export default async function FacultyProfilePage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const user = await getProfile(payload.sub as string)
    if (!user || !user.FacultyProfile) return (<div>Profile not found</div>)

    async function updateProfile(formData: FormData) {
        "use server"
        const fullName = formData.get("fullName") as string
        const department = formData.get("department") as string
        const designation = formData.get("designation") as string

        // Update user and faculty profile
        // Note: Ideally wrap in transaction
        await prisma.user.update({
            where: { id: user?.id },
            data: { fullName }
        })

        await prisma.facultyProfile.update({
            where: { userId: user?.id },
            data: {
                department,
                designation
            }
        })

        revalidatePath("/dashboard/faculty/profile")
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                My Profile
            </h1>

            <Card className="max-w-2xl glass-modern border-cyan-500/20">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-cyan-500">
                            <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-white">
                                {user.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                            <Badge variant="outline" className="mt-2 border-cyan-500 text-cyan-500">
                                {user.FacultyProfile.designation}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={updateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" defaultValue={user.fullName} className="bg-white/5 border-cyan-500/20" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" name="department" defaultValue={user.FacultyProfile.department} className="bg-white/5 border-cyan-500/20" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input id="designation" name="designation" defaultValue={user.FacultyProfile.designation} className="bg-white/5 border-cyan-500/20" />
                        </div>
                        <div className="pt-4">
                            <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-full">
                                <Save className="mr-2 h-4 w-4" /> Update Profile
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

// Helper badge component since I missed importing it
import { Badge } from "@/components/ui/badge"

