import { getFacultyDashboardStats } from "@/app/actions/faculty"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Clock, Users, Calendar } from "lucide-react"
import { format } from "date-fns"

export default async function FacultyDashboard() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const stats = await getFacultyDashboardStats(payload.sub as string)
    if (!stats) return <div>Loading...</div>

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Faculty Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-modern border-cyan-500/20 hover:border-cyan-500/40 transition-all hover-scale">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            {stats.totalProjects}
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-modern border-cyan-500/20 hover:border-cyan-500/40 transition-all hover-scale">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">
                            {stats.pendingApprovals}
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-modern border-cyan-500/20 hover:border-cyan-500/40 transition-all hover-scale">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Meetings</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400">
                            {stats.upcomingMeetings.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-cyan-400" />
                            Upcoming Meetings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.upcomingMeetings.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No upcoming meetings</p>
                            ) : (
                                stats.upcomingMeetings.map((meeting) => (
                                    <div key={meeting.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-cyan-500/10">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gradient-primary p-3 rounded-full">
                                                <Calendar className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{meeting.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Project: {meeting.Project.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-cyan-400">
                                                {format(new Date(meeting.date), "PPP")}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(meeting.date), "p")}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
