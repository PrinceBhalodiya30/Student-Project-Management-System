import { getStudentDashboardStats } from "@/app/actions/student"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderKanban, Users, Calendar, CheckSquare, ArrowRight, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function StudentDashboard() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const stats = await getStudentDashboardStats(payload.sub as string)
    if (!stats) return <div>Loading...</div>

    const { project, tasks, pendingTasks, upcomingMeetings, groupId } = stats

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Student Dashboard
            </h1>

            {!groupId ? (
                <Card className="glass-modern border-orange-500/50 bg-orange-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-500">
                            <AlertCircle className="h-5 w-5" />
                            Action Required: Form a Group
                        </CardTitle>
                        <CardDescription>
                            You are not part of any project group yet. Create a group or ask a leader to add you.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Link href="/dashboard/student/group">
                                Go to Group Formation <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ) : !project ? (
                <Card className="glass-modern border-blue-500/50 bg-blue-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-500">
                            <FolderKanban className="h-5 w-5" />
                            Submit Project Proposal
                        </CardTitle>
                        <CardDescription>
                            Your group is formed but you haven't submitted a project proposal yet.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
                            <Link href="/dashboard/student/proposal">
                                Submit Proposal <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Project Status Card */}
                    <Card className="glass-modern border-cyan-500/20 hover:border-cyan-500/40 transition-all md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">Project Status</CardTitle>
                            <FolderKanban className="h-5 w-5 text-cyan-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold">{project.title}</h3>
                                <Badge variant="outline" className={`
                                    ${project.status === 'APPROVED' ? 'border-green-500 text-green-500' : ''}
                                    ${project.status === 'PROPOSED' ? 'border-orange-500 text-orange-500' : ''}
                                    ${project.status === 'COMPLETED' ? 'border-blue-500 text-blue-500' : ''}
                                    ${project.status === 'REJECTED' ? 'border-red-500 text-red-500' : ''}
                                `}>
                                    {project.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

                            {/* Simple Progress Bar based on Milestones (if implemented properly, for now just static or based on tasks) */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Milestones Completed</span>
                                    <span>{project.Milestone?.filter(m => m.isCompleted).length || 0} / {project.Milestone?.length || 0}</span>
                                </div>
                                <Progress value={project.Milestone?.length ? (project.Milestone.filter(m => m.isCompleted).length / project.Milestone.length) * 100 : 0} className="h-2" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400">
                                <Link href="/dashboard/student/project">View Details</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pending Tasks Card */}
                    <Link href="/dashboard/student/tasks" className="block h-full">
                        <Card className="glass-modern border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
                                <CheckSquare className="h-4 w-4 text-orange-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-orange-400 mb-2">
                                    {pendingTasks}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    tasks require your attention
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Meetings */}
                <Card className="glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-400" />
                            Upcoming Meetings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingMeetings.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No upcoming meetings</p>
                            ) : (
                                upcomingMeetings.map((meeting) => (
                                    <div key={meeting.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-cyan-500/10">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-secondary p-2 rounded-lg">
                                                <Calendar className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm">{meeting.title}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(meeting.date), "PPP p")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="ghost" className="w-full text-cyan-400 hover:text-cyan-300">
                            <Link href="/dashboard/student/meetings">View All History</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Quick Actions */}
                <Card className="glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button asChild variant="outline" className="h-20 flex flex-col gap-2 border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/50">
                            <Link href="/dashboard/student/group">
                                <Users className="h-6 w-6 text-cyan-400" />
                                <span>My Group</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex flex-col gap-2 border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/50">
                            <Link href="/dashboard/student/profile">
                                <Users className="h-6 w-6 text-purple-400" />
                                <span>Profile</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
