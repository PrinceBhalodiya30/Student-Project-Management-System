import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { createProjectGroup, addMemberToGroup } from "@/app/actions/student"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, Plus, UserPlus } from "lucide-react"

export default async function StudentGroupPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const student = await prisma.studentProfile.findUnique({
        where: { userId: payload.sub as string },
        include: {
            ProjectGroup: {
                include: {
                    Project: true,
                    StudentProfile: {
                        include: { User: true }
                    }
                }
            }
        }
    })

    if (!student) return <div>Student profile not found. Please contact admin.</div>

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                My Group
            </h1>

            {!student.ProjectGroup ? (
                // No Group - Create one
                <Card className="max-w-md mx-auto mt-12 glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="text-center">Create a New Group</CardTitle>
                        <CardDescription className="text-center">
                            You are not in a group. Create one to become the leader and invite others.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            "use server"
                            const name = formData.get("groupName") as string
                            await createProjectGroup(payload.sub as string, name)
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="groupName">Group Name</Label>
                                <Input id="groupName" name="groupName" placeholder="e.g., The Avengers" required className="bg-white/5 border-cyan-500/20" />
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Create Group
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                // Has Group - information and add members
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="glass-modern border-cyan-500/20">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{student.ProjectGroup.name}</span>
                                    {student.isLeader && <Badge>Leader View</Badge>}
                                </CardTitle>
                                <CardDescription>Manage your group members.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {student.ProjectGroup.StudentProfile.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-gradient-secondary text-white">
                                                    {member.User.fullName.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.User.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{member.idNumber}</p>
                                            </div>
                                        </div>
                                        {member.isLeader && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Crown className="h-3 w-3 text-yellow-500" /> Leader
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {student.isLeader && (
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-cyan-400" />
                                        Add Member
                                    </CardTitle>
                                    <CardDescription>Add a student by their ID Number.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form action={async (formData) => {
                                        "use server"
                                        const idNumber = formData.get("idNumber") as string
                                        await addMemberToGroup(payload.sub as string, idNumber)
                                    }} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="idNumber">Student ID</Label>
                                            <Input id="idNumber" name="idNumber" placeholder="e.g., 2023001" required className="bg-white/5 border-cyan-500/20" />
                                        </div>
                                        <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                                            Add to Group
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                        <Card className="glass-modern border-cyan-500/20">
                            <CardHeader>
                                <CardTitle>Group Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>Maximum members: 4</p>
                                <p>Created: {student.ProjectGroup.createdAt.toLocaleDateString()}</p>
                                <p>Status: {student.ProjectGroup.Project ? "Project Assigned" : "No Project Linked"}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
