"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { FacultyLoad } from "@/components/admin/faculty-load"
import { RecentActivity } from "@/components/admin/recent-activity"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Users, Briefcase, GraduationCap, Activity,
    TrendingUp, CheckCircle2, Clock, Sparkles
} from "lucide-react"

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [facultyLoad, setFacultyLoad] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use cache headers to prevent caching
                const res = await fetch('/api/admin/stats', {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });

                console.log('API Response Status:', res.status, res.statusText);

                if (res.ok) {
                    const data = await res.json();
                    console.log('Dashboard data received:', data);
                    console.log('Stats:', data.stats);

                    if (data.stats) {
                        setStats(data.stats);
                        console.log('Stats state updated:', data.stats);
                    } else {
                        console.error('No stats in response data');
                    }

                    setFacultyLoad(data.facultyLoad || []);
                    setRecentActivity(data.recentActivity || []);
                } else {
                    console.error('API request failed:', res.status, res.statusText);
                    const errorText = await res.text();
                    console.error('Error response:', errorText);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                if (error instanceof Error) {
                    console.error("Error message:", error.message);
                    console.error("Error stack:", error.stack);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle both number and string formats for completionRate
    const completionRate = stats?.completionRate
        ? (typeof stats.completionRate === 'string'
            ? parseFloat(stats.completionRate.replace('%', ''))
            : stats.completionRate)
        : 0;

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* Floating Particles */}
            <div className="particles">
                <div className="particle" style={{ width: '100px', height: '100px', top: '10%', left: '10%', animationDelay: '0s' }} />
                <div className="particle" style={{ width: '150px', height: '150px', top: '60%', right: '10%', animationDelay: '2s' }} />
                <div className="particle" style={{ width: '80px', height: '80px', bottom: '20%', left: '20%', animationDelay: '4s' }} />
            </div>

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="Dashboard" />
            </div>

            <main suppressHydrationWarning className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slide-down">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent flex items-center gap-3 selection:text-white selection:bg-cyan-500/20">
                            <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse-slow" />
                            Overview
                        </h1>
                        <p className="text-muted-foreground mt-2">Welcome back, Administrator. Here's what's happening today.</p>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Projects */}
                    <Card className="glass-modern border-cyan-500/20 hover-float stagger-item relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30 hover-scale">
                                <Briefcase className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-cyan-400">
                                <AnimatedCounter to={stats?.totalProjects || 0} />
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                                <TrendingUp className="h-3 w-3" />
                                <span>+12% from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Students */}
                    <Card className="glass-modern border-cyan-500/20 hover-float stagger-item relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 hover-scale">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-blue-400">
                                <AnimatedCounter to={stats?.activeStudents || 0} />
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                                <TrendingUp className="h-3 w-3" />
                                <span>+8% from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Faculty Mentors */}
                    <Card className="glass-modern border-cyan-500/20 hover-float stagger-item relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Faculty Mentors</CardTitle>
                            <div className="p-2 rounded-xl bg-gradient-success shadow-lg shadow-emerald-500/30 hover-scale">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-emerald-400">
                                <AnimatedCounter to={stats?.totalFaculty || 0} />
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Activity className="h-3 w-3" />
                                <span>{stats?.activeFaculty || 0} active</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completion Rate */}
                    <Card className="glass-modern border-cyan-500/20 hover-float stagger-item relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                            <div className="p-2 rounded-xl bg-gradient-warning shadow-lg shadow-amber-500/30 hover-scale">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-amber-400">
                                <AnimatedCounter to={Math.round(completionRate)} />%
                            </div>
                            <Progress value={completionRate} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Faculty Load */}
                    <Card className="lg:col-span-2 glass-modern border-cyan-500/20 hover-float animate-slide-up">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-cyan-400" />
                                Faculty Workload
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FacultyLoad facultyLoad={facultyLoad} />
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="glass-modern border-cyan-500/20 hover-float animate-slide-up">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-cyan-400" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RecentActivity activities={recentActivity} />
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="glass-modern border-cyan-500/20 hover-float animate-fade-in">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                onClick={() => router.push('/dashboard/admin/projects')}
                                className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-cyan-500/30 hover-scale active-press h-auto py-4"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Briefcase className="h-6 w-6" />
                                    <span>Create Project</span>
                                </div>
                            </Button>
                            <Button
                                onClick={() => router.push('/dashboard/admin/allocations')}
                                className="bg-gradient-success hover:opacity-90 shadow-lg shadow-emerald-500/30 hover-scale active-press h-auto py-4"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    <span>Assign Faculty</span>
                                </div>
                            </Button>
                            <Button
                                onClick={() => router.push('/dashboard/admin/reports')}
                                className="bg-gradient-warning hover:opacity-90 shadow-lg shadow-amber-500/30 hover-scale active-press h-auto py-4"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Activity className="h-6 w-6" />
                                    <span>View Reports</span>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
