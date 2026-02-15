"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TopBar } from "@/components/dashboard/top-bar"
import { CheckCircle2, Clock, MessageSquare, MoreVertical, Paperclip, Plus, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

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
        return <div className="p-8 text-white">Loading dashboard...</div>
    }

    const { user, project, milestones } = stats || {}

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 font-sans">
            <TopBar title="Student Overview" />
            <main className="flex-1 overflow-y-auto p-8">
                {/* Top Section: Hero + Stats */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">

                    {/* Main Hero Card */}
                    <Card className="col-span-2 overflow-hidden border-none bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-xl relative">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>

                        <CardHeader className="relative z-10 pb-2">
                            <Badge className="w-fit bg-white/20 hover:bg-white/30 text-white border-0 mb-2 uppercase">
                                {project?.status?.replace('_', ' ') || 'NO STATUS'}
                            </Badge>
                            <CardTitle className="text-3xl font-bold tracking-tight">
                                {project?.title || "No Project Assigned"}
                            </CardTitle>
                            <CardDescription className="text-blue-100/80 text-base mt-2">
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

                            {/* Circular Progress Mockup */}
                            <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                <div className="relative h-20 w-20 flex items-center justify-center rounded-full border-4 border-white/20 border-t-white">
                                    <span className="text-xl font-bold">{project?.progress || 0}%</span>
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider mt-2 opacity-80">Completion</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestone Tracker Card */}
                    <Card className="col-span-1 bg-slate-900 border-slate-800 shadow-lg text-slate-100">
                        <CardHeader>
                            <CardTitle className="text-lg text-cyan-400">Milestone Tracker</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-white">{milestones?.completed || 0}</span>
                                        <span className="text-sm text-slate-500">/ {milestones?.total || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-white">
                                            {(milestones?.total || 0) - (milestones?.completed || 0)}
                                        </span>
                                        <span className="text-sm text-slate-500">tasks</span>
                                    </div>
                                </div>
                            </div>

                            <Link href="/dashboard/student/project">
                                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border-slate-700 mt-4" variant="outline">
                                    View Project Details
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section: Deadlines & Actions */}
                <div className="grid gap-6 md:grid-cols-2">

                    {/* Upcoming Deadlines */}
                    <Card className="bg-slate-900 border-slate-800 text-slate-100">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-cyan-400" />
                                Upcoming Deadlines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {milestones?.upcoming?.length > 0 ? (
                                milestones.upcoming.map((m: any) => (
                                    <div key={m.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center gap-3">
                                        <div className="flex flex-col items-center justify-center h-10 w-10 bg-cyan-500/10 rounded-md text-cyan-500">
                                            <span className="text-[10px] font-bold uppercase">Due</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-white">{m.title}</h4>
                                            <p className="text-xs text-slate-400">
                                                {new Date(m.deadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                                            Pending
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No upcoming deadlines found.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-slate-900 border-slate-800 text-slate-100">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="h-5 w-5 text-cyan-400" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Link href="/dashboard/student/tasks">
                                <div className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 flex flex-col items-center justify-center gap-2 group">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium">My Tasks</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/student/project">
                                <div className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 flex flex-col items-center justify-center gap-2 group">
                                    <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Paperclip className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium">Docs</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/student/schedule">
                                <div className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 flex flex-col items-center justify-center gap-2 group">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium">Schedule</span>
                                </div>
                            </Link>
                            <div className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 flex flex-col items-center justify-center gap-2 group">
                                <div className="h-10 w-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium">Chat</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    )
}
