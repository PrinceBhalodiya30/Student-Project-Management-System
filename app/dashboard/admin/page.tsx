"use client"

import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { FacultyLoad } from "@/components/admin/faculty-load"
import { RecentActivity } from "@/components/admin/recent-activity"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    Users,
    Briefcase,
    GraduationCap,
    Activity,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    FileText,
    LayoutDashboard,
    ArrowRight
} from "lucide-react"

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [facultyLoad, setFacultyLoad] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Keep the existing API call
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setFacultyLoad(data.facultyLoad || []);
                    setRecentActivity(data.recentActivity);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Derived state for progress bars
    const completionRate = stats?.completionRate ? parseFloat(stats.completionRate) : 0;
    const activeProjectCount = stats?.activeProjects ? parseInt(stats.activeProjects) : 0;
    const totalCapacity = 150; // Example total capacity
    const capacityPercentage = Math.min(100, (activeProjectCount / totalCapacity) * 100);

    return (
        <div className="flex flex-col min-h-screen bg-muted/10">
            {/* Top Bar with distinct background */}
            <div className="bg-background border-b border-border sticky top-0 z-30">
                <AdminTopBar title="Dashboard" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
                        <p className="text-muted-foreground mt-1">Welcome back, Administrator. Here's what's happening today.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
                            <Activity className="h-4 w-4" />
                            Refresh Data
                        </Button>
                        <Button className="gap-2" onClick={() => window.location.href = '/dashboard/admin/allocations'}>
                            <ArrowUpRight className="h-4 w-4" />
                            Allocate Groups
                        </Button>
                    </div>
                </div>

                {/* KPI Cards Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.activeProjects}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className={completionRate > 50 ? "text-emerald-600" : "text-amber-600"}>
                                    {loading ? "..." : `${stats?.completionRate}%`} completion
                                </span> rate
                            </p>
                            <Progress value={completionRate} className="h-1 mt-3" />
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.activeStudents}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across {Math.ceil(activeProjectCount / 4)} groups
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Faculty Mentors</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.facultyAdvisors}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Active guides
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : (parseInt(stats?.unassignedProjects || "0"))}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Requires attention
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid: 2/3 Lef, 1/3 Right */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Left Column (Wide) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Project Status Overview */}
                        {/* Simplified Project Status Overview */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>Quick access to pending items</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 flex flex-col justify-between h-32 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/admin/allocations'}>
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-blue-950 dark:text-blue-100">{stats?.unassignedProjects || 0}</div>
                                        <div className="text-sm font-medium text-blue-600 dark:text-blue-300">Unassigned Projects</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Faculty/Guide Load */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Faculty Workload</CardTitle>
                                <CardDescription>Active project distribution among top guides</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FacultyLoad faculty={facultyLoad} loading={loading} />
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column (Narrow) */}
                    <div className="space-y-6">



                        {/* Recent Activity Feed */}
                        <Card className="shadow-sm h-[500px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Activity</CardTitle>
                                <CardDescription>Latest system events</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
                                <RecentActivity activities={recentActivity} loading={loading} />
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </main>
        </div>
    )
}
