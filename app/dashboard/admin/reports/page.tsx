"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, FileText, GraduationCap, Download, TrendingUp, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"

export default function ReportsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchReports() {
            setLoading(true)
            try {
                const res = await fetch('/api/reports')
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (error) {
                console.error("Failed to fetch reports", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="Reports" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-cyan-400 animate-slide-down">
                            System Reports
                        </h1>
                        <p className="text-muted-foreground mt-2">Analytics and insights across all projects</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => window.open('/api/reports/export?type=projects', '_blank')}
                            variant="outline"
                            className="glass-modern border-cyan-500/20 hover:bg-cyan-500/10"
                        >
                            <Download className="w-4 h-4 mr-2" /> Export Projects
                        </Button>
                        <Button
                            onClick={() => window.open('/api/reports/export?type=students', '_blank')}
                            className="bg-gradient-to-r bg-gradient-primary hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-cyan-500/30"
                        >
                            <Download className="w-4 h-4 mr-2" /> Export Students
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-modern border-cyan-500/20 hover-float overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Projects</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br bg-gradient-primary shadow-lg shadow-cyan-500/30">
                                <Briefcase className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-cyan-400">
                                {loading ? "..." : data?.metrics?.totalProjects}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-blue-500/20 hover-float overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Students</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-blue-400">
                                {loading ? "..." : data?.metrics?.activeStudents}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-amber-500/20 hover-float overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Avg Completion</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg shadow-amber-500/30">
                                <Clock className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-amber-400">
                                {loading ? "..." : data?.metrics?.avgCompletionTime}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Target: &lt; 5 Months</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-emerald-500/20 hover-float overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Success Rate</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/30">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-emerald-400">
                                {loading ? "..." : data?.metrics?.successRate}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Based on submissions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Reports */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Project Status Breakdown */}
                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br bg-gradient-primary">
                                    <Briefcase className="h-3.5 w-3.5 text-white" />
                                </div>
                                Project Status Breakdown
                            </CardTitle>
                            <CardDescription>Distribution by current status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 skeleton" />)}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data?.statusBreakdown?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 glass-modern border-cyan-500/20 rounded-lg hover:bg-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Badge className={
                                                    item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        item.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }>
                                                    {item.status}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">{item.count} projects</span>
                                            </div>
                                            <span className="text-sm font-semibold text-cyan-400">{item.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Department Distribution */}
                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                                    <Users className="h-3.5 w-3.5 text-white" />
                                </div>
                                Department Distribution
                            </CardTitle>
                            <CardDescription>Projects by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 skeleton" />)}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data?.deptBreakdown?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 glass-modern border-blue-500/20 rounded-lg hover:bg-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                                                <span className="text-sm font-medium">{item.dept}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-muted-foreground">{item.count} projects</span>
                                                <span className="text-sm font-semibold text-blue-400">{item.percentage}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Submissions */}
                <Card className="glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600">
                                <FileText className="h-3.5 w-3.5 text-white" />
                            </div>
                            Recent Submissions
                        </CardTitle>
                        <CardDescription>Latest project submissions and completions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 skeleton" />)}
                            </div>
                        ) : data?.recentSubmissions?.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentSubmissions.map((sub: any, idx: number) => (
                                    <div key={idx} className="p-4 glass-modern border-emerald-500/20 rounded-lg hover:bg-white/5 transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold group-hover:text-emerald-400 transition-colors">{sub.projectTitle}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">{sub.studentName}</p>
                                            </div>
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                {sub.date}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No recent submissions
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
