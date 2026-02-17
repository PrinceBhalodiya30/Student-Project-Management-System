"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { CheckCircle2, Clock, MessageSquare, Paperclip, Plus, Loader2, Sparkles, Folder } from "lucide-react"
import Link from "next/link"
import { AnimatedCounter } from "@/components/ui/animated-counter"

export default function StudentDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/student/stats')
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Failed to fetch stats", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        )
    }

    const { user, project, milestones } = stats || {}

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="Student Overview" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slide-down">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent flex items-center gap-3 selection:text-white selection:bg-cyan-500/20">
                            <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse-slow" />
                            Welcome Back, {user?.name?.split(' ')[0] || 'Student'}
                        </h1>
                        <p className="text-muted-foreground mt-2">Here's what's happening with your project today.</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-3 animate-slide-up">

                    {/* Main Hero Card */}
                    <Card className="col-span-1 md:col-span-2 overflow-hidden border-none bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-xl relative group">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-700"></div>

                        <CardHeader className="relative z-10 pb-2">
                            <Badge className="w-fit bg-white/20 hover:bg-white/30 text-white border-0 mb-2 uppercase backdrop-blur-md">
                                {project?.status?.replace('_', ' ') || 'NO STATUS'}
                            </Badge>
                            <CardTitle className="text-3xl font-bold tracking-tight">
                                {project?.title || "No Project Assigned"}
                            </CardTitle>
                            <CardDescription className="text-blue-100/80 text-base mt-2 flex items-center gap-2">
                                <Folder className="h-4 w-4" />
                                Guide: {project?.guide || "Not Assigned"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10 grid grid-cols-3 gap-6 items-end mt-4">
                            <div className="col-span-2 space-y-4">
                                <div className="flex justify-between text-sm font-medium opacity-90">
                                    <span>Overall Progress</span>
                                    <span>{project?.progress || 0}%</span>
                                </div>
                                <Progress value={project?.progress || 0} className="h-2 bg-blue-900/30" />
                                <div className="flex items-center gap-2 text-sm text-blue-100/70 mt-4">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {milestones?.upcoming?.length > 0
                                            ? `${new Date(milestones.upcoming[0].deadline).toLocaleDateString()} - Next Deadline`
                                            : "No upcoming deadlines"}
                                    </span>
                                </div>
                            </div>

                            {/* Circular Progress */}
                            <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                <div className="relative h-20 w-20 flex items-center justify-center rounded-full border-4 border-white/20 border-t-white">
                                    <span className="text-xl font-bold"><AnimatedCounter to={project?.progress || 0} />%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestone Tracker Card */}
                    <Card className="col-span-1 glass-modern border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                        <CardHeader>
                            <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Milestones
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</h4>
                                        <p className="text-xl font-bold text-foreground">{milestones?.completed || 0}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500">/ {milestones?.total || 0} Total</div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</h4>
                                        <p className="text-xl font-bold text-foreground">{(milestones?.total || 0) - (milestones?.completed || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/dashboard/student/project" className="block mt-4">
                                <Button className="w-full glass-modern border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" variant="outline">
                                    View Details
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section: Deadlines & Actions */}
                <div className="grid gap-6 md:grid-cols-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>

                    {/* Upcoming Deadlines */}
                    <Card className="glass-modern border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-cyan-400" />
                                Upcoming Deadlines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {milestones?.upcoming?.length > 0 ? (
                                milestones.upcoming.map((m: any) => (
                                    <div key={m.id} className="p-4 rounded-lg bg-white/5 border border-slate-800 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                        <div className="flex flex-col items-center justify-center h-12 w-12 bg-cyan-500/10 rounded-lg text-cyan-500 border border-cyan-500/20">
                                            <span className="text-[10px] font-bold uppercase">{new Date(m.deadline).getDate()}</span>
                                            <span className="text-[10px] uppercase opacity-70">{new Date(m.deadline).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-foreground">{m.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Due in {Math.ceil((new Date(m.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                                            Pending
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm italic">
                                    No upcoming deadlines found.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="glass-modern border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="h-5 w-5 text-cyan-400" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <QuickActionCard
                                href="/dashboard/student/tasks"
                                icon={<CheckCircle2 className="h-5 w-5" />}
                                title="My Tasks"
                                color="blue"
                            />
                            <QuickActionCard
                                href="/dashboard/student/project"
                                icon={<Paperclip className="h-5 w-5" />}
                                title="Documents"
                                color="purple"
                            />
                            <QuickActionCard
                                href="/dashboard/student/schedule"
                                icon={<Clock className="h-5 w-5" />}
                                title="Schedule"
                                color="emerald"
                            />
                            <QuickActionCard
                                href="/dashboard/student/chat"
                                icon={<MessageSquare className="h-5 w-5" />}
                                title="Chat"
                                color="amber"
                            />
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    )
}

function QuickActionCard({ href, icon, title, color }: any) {
    const colorClasses: any = {
        blue: "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30",
        purple: "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30",
        emerald: "bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30",
        amber: "bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30",
    };

    return (
        <Link href={href}>
            <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/5 flex flex-col items-center justify-center gap-3 group hover:-translate-y-1 duration-300">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${colorClasses[color]}`}>
                    {icon}
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{title}</span>
            </div>
        </Link>
    )
}
