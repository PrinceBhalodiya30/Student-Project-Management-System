"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Calendar, Folder, AlertCircle, Clock,
    Sparkles, Layers, ListTodo
} from "lucide-react"

export default function FacultyDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const resStats = await fetch('/api/faculty/stats');
                if (resStats.ok) {
                    const data = await resStats.json();
                    setStats(data.stats);
                }

                // Fetch Projects
                const resProjects = await fetch('/api/faculty/projects');
                if (resProjects.ok) {
                    const data = await resProjects.json();
                    setProjects(data);
                }

            } catch (error) {
                console.error("Failed to fetch faculty data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* Floating Particles */}
            <div className="particles">
                <div className="particle" style={{ width: '100px', height: '100px', top: '10%', left: '10%', animationDelay: '0s' }} />
                <div className="particle" style={{ width: '150px', height: '150px', top: '60%', right: '10%', animationDelay: '2s' }} />
            </div>

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="My Dashboard" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slide-down">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse-slow" />
                            Faculty Overview
                        </h1>
                        <p className="text-muted-foreground mt-2">Manage your projects and student progress.</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                    <MetricCard
                        title="Active Projects"
                        value={stats?.activeProjects || 0}
                        icon={<Folder className="h-5 w-5 text-blue-400" />}
                        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                    />
                    <MetricCard
                        title="Meetings Today"
                        value={stats?.meetingsToday || 0}
                        icon={<Calendar className="h-5 w-5 text-amber-400" />}
                        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                    />
                    <MetricCard
                        title="Pending Reviews"
                        value={stats?.pendingReviews || 0}
                        icon={<ListTodo className="h-5 w-5 text-emerald-400" />}
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                    />
                </div>

                {/* Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Assigned Projects */}
                    <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">Assigned Projects</h2>
                            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/faculty/projects')}>View All</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.length === 0 ? (
                                <div className="col-span-2 p-8 text-center glass-modern rounded-xl border-dashed border-2 border-slate-700">
                                    <p className="text-muted-foreground">No projects assigned yet.</p>
                                </div>
                            ) : (
                                projects.slice(0, 4).map((project, i) => (
                                    <ProjectCard key={project.id} project={project} index={i} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Card className="glass-modern border-cyan-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-cyan-400" />
                                    Upcoming Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats?.meetingsToday > 0 ? (
                                    <div className="space-y-4">
                                        {/* Mock Data - In real app fetch meetings */}
                                        <div className="p-3 bg-white/5 rounded-lg border-l-2 border-amber-500">
                                            <p className="text-sm font-semibold">Project Review</p>
                                            <p className="text-xs text-muted-foreground">Today, 2:00 PM</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No meetings scheduled for today.</p>
                                )}
                                <Button className="w-full mt-4" variant="ghost" size="sm">View Calendar</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

function MetricCard({ title, value, icon, gradient }: any) {
    return (
        <Card className="glass-modern border-cyan-500/20 hover-float relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 ${gradient}`} />
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <div className="text-3xl font-bold text-foreground">
                        <AnimatedCounter to={value} />
                    </div>
                </div>
                <div className={`p-3 rounded-xl shadow-lg ${gradient}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

function ProjectCard({ project, index }: any) {
    // Determine status color
    const statusColors: any = {
        PROPOSED: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        APPROVED: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        IN_PROGRESS: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        COMPLETED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
    };
    const colorClass = statusColors[project.status] || "text-slate-400 bg-slate-500/10 border-slate-500/20";

    return (
        <Card className="glass-modern border-slate-800 hover:border-cyan-500/30 transition-all duration-300 hover-scale group cursor-pointer h-full">
            <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold ${colorClass}`}>
                        {project.status.replace('_', ' ')}
                    </Badge>
                    {project.Type && <span className="text-[10px] text-muted-foreground border px-1.5 py-0.5 rounded border-slate-800">{project.Type.name}</span>}
                </div>

                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {project.title}
                </h3>

                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {project.description}
                </p>

                <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {project.ProjectGroup?.StudentProfile?.slice(0, 3).map((student: any) => (
                            <Avatar key={student.id} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-[8px] bg-slate-800 text-slate-300">
                                    {student.User?.fullName?.substring(0, 2).toUpperCase() || "ST"}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {(project.ProjectGroup?.StudentProfile?.length || 0) > 3 && (
                            <div className="h-6 w-6 rounded-full bg-slate-800 border-2 border-background flex items-center justify-center text-[8px] text-slate-400">
                                +{project.ProjectGroup.StudentProfile.length - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
