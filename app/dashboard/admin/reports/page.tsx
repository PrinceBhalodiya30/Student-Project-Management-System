"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, FileText, Download, TrendingUp, Archive, Activity, PieChart, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts'

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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-background to-background pointer-events-none" />
            <div className="fixed inset-0 bg-grid-white/[0.02] pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/10 sticky top-0 z-30">
                <AdminTopBar title="Analytics" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1700px] mx-auto w-full relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent selection:text-white selection:bg-cyan-500/20">
                            System Intelligence
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">Real-time insights across academic projects</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => window.location.href = '/api/reports/export?type=projects'}
                            variant="outline"
                            className="glass-effect hover:bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                        >
                            <Download className="w-4 h-4 mr-2" /> Export Projects
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/api/reports/export?type=students'}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 border-0"
                        >
                            <Download className="w-4 h-4 mr-2" /> Export Students
                        </Button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Projects"
                        value={data?.metrics?.totalProjects}
                        icon={Briefcase}
                        trend="All Time"
                        color="cyan"
                        loading={loading}
                    />
                    <StatsCard
                        title="Active Investigators"
                        value={data?.metrics?.activeStudents}
                        icon={Users}
                        trend="Enrolled Students"
                        color="blue"
                        loading={loading}
                    />
                    <StatsCard
                        title="Completion Rate"
                        value={data?.metrics?.successRate}
                        icon={TrendingUp}
                        trend="Successful Projects"
                        color="emerald"
                        loading={loading}
                    />
                    <StatsCard
                        title="Avg Duration"
                        value={data?.metrics?.avgCompletionTime}
                        icon={Activity}
                        trend="Months to Complete"
                        color="violet"
                        loading={loading}
                    />
                </div>

                {/* Charts Area */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Chart: Project Status */}
                    <Card className="lg:col-span-2 glass-modern border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-cyan-400" />
                                Project Status Distribution
                            </CardTitle>
                            <CardDescription>Current phase breakdown of all projects</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading Visualization...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.statusBreakdown}>
                                        <defs>
                                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                                        <XAxis dataKey="status" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1500}>
                                            {
                                                data?.statusBreakdown?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={
                                                        entry.status === 'COMPLETED' ? '#10b981' :
                                                            entry.status === 'IN_PROGRESS' ? '#3b82f6' :
                                                                entry.status === 'APPROVED' ? '#8b5cf6' :
                                                                    '#f59e0b'
                                                    } />
                                                ))
                                            }
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Secondary Chart: Department Split */}
                    <Card className="glass-modern border-white/5 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-purple-400" />
                                Department Split
                            </CardTitle>
                            <CardDescription>Projects via Dept</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={data?.charts?.byDepartment}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="count"
                                        >
                                            {data?.charts?.byDepartment?.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Table (Modified) */}
                <Card className="glass-modern border-white/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Archive className="w-5 h-5 text-emerald-400" />
                            Recent Submission Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 skeleton bg-white/5 rounded-lg" />)}
                            </div>
                        ) : (
                            <div className="rounded-lg overflow-hidden border border-white/5">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-muted-foreground font-medium border-b border-white/5">
                                        <tr>
                                            <th className="px-4 py-3">Project Title</th>
                                            <th className="px-4 py-3">Status Update</th>
                                            <th className="px-4 py-3 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data?.recentActivity?.map((act: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-200">{act.project}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{act.desc}</td>
                                                <td className="px-4 py-3 text-right font-mono text-xs text-slate-500">{act.date}</td>
                                            </tr>
                                        ))}
                                        {(!data?.recentActivity || data.recentActivity.length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No recent activity found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, trend, color, loading }: any) {
    const colorMap: any = {
        cyan: "from-cyan-500 to-blue-500 text-cyan-400",
        blue: "from-blue-500 to-indigo-500 text-blue-400",
        emerald: "from-emerald-500 to-green-500 text-emerald-400",
        violet: "from-violet-500 to-purple-500 text-violet-400"
    };

    return (
        <Card className="glass-modern border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 duration-300 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[color]} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} opacity-80 shadow-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className={`text-2xl font-bold ${colorMap[color].split(' ').pop()}`}>
                    {loading ? "..." : value}
                </div>
                <p className="text-xs text-slate-500 mt-1">{trend}</p>
            </CardContent>
        </Card>
    );
}
