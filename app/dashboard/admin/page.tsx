"use client"

import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { PendingApprovals } from "@/components/admin/pending-approvals"
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
    const [approvals, setApprovals] = useState<any[]>([]);
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
                    setApprovals(data.approvals);
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
                            <div className="text-2xl font-bold">{loading ? "..." : (approvals.length + (parseInt(stats?.unassignedGroups || "0")))}</div>
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
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Project Status Overview</CardTitle>
                                <CardDescription>Current academic year progress tracking</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">System Capacity</span>
                                        <span className="text-muted-foreground">{activeProjectCount} / {totalCapacity} projects</span>
                                    </div>
                                    <Progress value={capacityPercentage} className="h-2" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                                <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-sm font-medium">Unassigned Groups</span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <span className="text-2xl font-bold">{stats?.unassignedGroups || 0}</span>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" onClick={() => window.location.href = '/dashboard/admin/allocations'}>
                                                Manage <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-medium">Reports Submitted</span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            {/* Dummy data or 0 if not available */}
                                            <span className="text-2xl font-bold">0</span>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-emerald-600" onClick={() => window.location.href = '/dashboard/admin/reports'}>
                                                View <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Approvals (Table View) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    Pending Approvals
                                    {approvals.length > 0 && <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0">{approvals.length}</Badge>}
                                </h3>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button>
                            </div>
                            <PendingApprovals approvals={approvals} loading={loading} />
                        </div>

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
