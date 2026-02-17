import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMeeting } from "@/app/actions/faculty"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react"
import Link from "next/link"

async function getFacultyMeetings(userId: string) {
    const faculty = await prisma.facultyProfile.findUnique({
        where: { userId },
        include: {
            Project: {
                select: { id: true, title: true }
            }
        }
    })

    if (!faculty) return { meetings: [], projects: [] }

    const meetings = await prisma.meeting.findMany({
        where: {
            projectId: {
                in: faculty.Project.map(p => p.id)
            }
        },
        include: {
            Project: true
        },
        orderBy: {
            date: 'desc'
        }
    })

    return { meetings, projects: faculty.Project }
}

export default async function FacultyMeetingsPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const { meetings, projects } = await getFacultyMeetings(payload.sub as string)

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        Meetings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Schedule and manage project meetings.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25">
                            <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-modern border-cyan-500/20">
                        <DialogHeader>
                            <DialogTitle>Schedule New Meeting</DialogTitle>
                            <DialogDescription>Set up a meeting with a project group.</DialogDescription>
                        </DialogHeader>
                        <form action={async (formData) => {
                            "use server"
                            const projectId = formData.get("projectId") as string
                            const title = formData.get("title") as string
                            const dateStr = formData.get("date") as string
                            await createMeeting(projectId, title, new Date(dateStr))
                        }}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projectId">Project Group</Label>
                                    <Select name="projectId" required>
                                        <SelectTrigger className="bg-white/5 border-cyan-500/20">
                                            <SelectValue placeholder="Select project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Meeting Title</Label>
                                    <Input id="title" name="title" placeholder="e.g., Sprint Review 1" required className="bg-white/5 border-cyan-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date & Time</Label>
                                    <Input id="date" name="date" type="datetime-local" required className="bg-white/5 border-cyan-500/20" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Schedule</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {meetings.length === 0 ? (
                    <Card className="glass-modern border-cyan-500/20 py-12 text-center">
                        <div className="flex flex-col items-center">
                            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No meetings scheduled</h3>
                        </div>
                    </Card>
                ) : (
                    meetings.map(meeting => (
                        <Card key={meeting.id} className="glass-modern border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-primary p-3 rounded-full">
                                        <CalendarIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">{meeting.title}</h4>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{meeting.Project.title}</span>
                                            <span>•</span>
                                            <Clock className="h-3 w-3" />
                                            <span>{format(new Date(meeting.date), "PPP p")}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400">
                                    <Link href={`/dashboard/faculty/meetings/${meeting.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
