"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, User, Calendar, Download, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setApprovals(data.approvals);
                    // Format relative time for activity here if needed or use raw
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

    // Simple relative time formatter
    const timeAgo = (dateIdx: any) => {
        const date = new Date(dateIdx);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };


    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100">
            {/* Top Bar Override or usage */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-[#0f172a]">
                {/* Search */}
                <div className="w-96">
                    <input
                        suppressHydrationWarning
                        className="w-full bg-[#1e293b] border-none rounded-lg py-2 px-4 text-sm text-slate-300 placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Search projects, students, or faculty..."
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" suppressHydrationWarning>
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full"></span>
                    </Button>
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-8">
                {/* Header Section */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
                        <p className="text-slate-400">Project management performance metrics.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="bg-[#1e293b] border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white gap-2" suppressHydrationWarning>
                            <Calendar className="h-4 w-4" />
                            Last 30 Days
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2" suppressHydrationWarning>
                            <Download className="h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Active Projects"
                        value={loading ? "..." : stats?.activeProjects ?? 0}
                        trend="+0%" // You can calculate trend if you fetch historical data
                        trendNeutral={true}
                        chartPath="M5 25 Q15 25 25 10 T45 25"
                    />
                    <StatsCard
                        title="Active Students"
                        value={loading ? "..." : stats?.activeStudents ?? 0}
                        trend="+0%"
                        trendNeutral={true}
                        chartPath="M5 28 Q20 28 35 15 T65 20 Q80 20 95 10"
                    />
                    <StatsCard
                        title="Faculty Advisors"
                        value={loading ? "..." : stats?.facultyAdvisors ?? 0}
                        trend="0%"
                        trendNeutral={true}
                        chartDots={true}
                    />
                    <StatsCard
                        title="Completion Rate"
                        value={loading ? "..." : stats?.completionRate ?? "0%"}
                        trend={loading ? "..." : stats?.completionRate ?? "0%"}
                        trendNeutral={true} // Simplify trend logic for now
                        chartPath="M5 10 Q25 5 45 20 T85 15"
                    />
                </div>

                <div className="grid grid-cols-3 gap-8">
                    {/* Approvals Table */}
                    <div className="col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Pending Approvals</h2>
                            <span className="text-sm text-blue-400 cursor-pointer hover:underline">View all</span>
                        </div>
                        <div className="bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                                <div className="col-span-5">Project</div>
                                <div className="col-span-3">Student</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            {loading ? (
                                <div className="p-4 text-slate-400">Loading approvals...</div>
                            ) : approvals.length === 0 ? (
                                <div className="p-4 text-slate-400">No pending approvals.</div>
                            ) : (
                                approvals.map((approval: any) => (
                                    <ApprovalRow
                                        key={approval.id}
                                        title={approval.title}
                                        type={approval.type}
                                        student={approval.student}
                                        date={approval.date}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="col-span-1">
                        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                        <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-6">
                            <div className="space-y-8 relative">
                                <div className="absolute top-2 left-[15px] bottom-2 w-0.5 bg-slate-800"></div>

                                {loading ? (
                                    <div className="pl-8">Loading activity...</div>
                                ) : recentActivity.length === 0 ? (
                                    <div className="pl-8 text-slate-400">No recent activity.</div>
                                ) : (
                                    recentActivity.map((activity: any, idx: number) => (
                                        <ActivityItem
                                            key={idx}
                                            icon={
                                                activity.iconType === 'project' ? <div className="h-2 w-2 bg-blue-500 rounded-full"></div> :
                                                    activity.iconType === 'user' ? <User className="h-3 w-3 text-indigo-500" /> :
                                                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                            }
                                            iconBg={
                                                activity.iconType === 'project' ? "bg-blue-500/20" :
                                                    activity.iconType === 'user' ? "bg-indigo-500/20" :
                                                        "bg-amber-500/20"
                                            }
                                            title={activity.title}
                                            desc={activity.desc}
                                            time={timeAgo(activity.time)}
                                        />
                                    ))
                                )}
                            </div>
                            <Button variant="ghost" className="w-full mt-6 text-slate-400 hover:text-white text-xs" suppressHydrationWarning>
                                View All Activity
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function StatsCard({ title, value, trend, trendUp, trendDown, trendNeutral, chartPath, chartDots }: any) {
    let badgeColor = "bg-green-500/10 text-green-500"
    if (trendDown) badgeColor = "bg-red-500/10 text-red-500"
    if (trendNeutral) badgeColor = "bg-slate-500/10 text-slate-400"

    return (
        <Card className="bg-[#1e293b] border-slate-800 text-slate-100 overflow-hidden relative">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-slate-400 text-sm font-medium">{title}</span>
                    <Badge variant="secondary" className={`${badgeColor} border-none`}>{trend}</Badge>
                </div>
                <div className="text-3xl font-bold mb-4">{value}</div>

                {/* Visual - Simplified Chart */}
                <div className="h-8 w-full opacity-50">
                    {chartDots ? (
                        <div className="flex gap-1 mt-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                                <div key={i} className="h-1 w-1 bg-blue-500 rounded-full"></div>
                            ))}
                        </div>
                    ) : (
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <path d={chartPath || "M0 10 Q10 10 20 20"} fill="none" stroke={trendDown ? "#ef4444" : "#3b82f6"} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function ApprovalRow({ title, type, student, date }: any) {
    return (
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 items-center hover:bg-slate-800/50 transition-colors">
            <div className="col-span-5">
                <div className="font-semibold text-white text-sm">{title}</div>
                <div className="text-xs text-slate-500">{type}</div>
            </div>
            <div className="col-span-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">{student}</span>
                </div>
            </div>
            <div className="col-span-2 text-sm text-slate-400 font-mono">{date}</div>
            <div className="col-span-2 text-right flex justify-end gap-2">
                <button className="text-xs text-slate-400 hover:text-white font-medium px-2 py-1">Review</button>
                <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1 font-medium">Approve</button>
            </div>
        </div>
    )
}

function ActivityItem({ icon, iconBg, title, desc, time }: any) {
    return (
        <div className="flex gap-4 relative z-10">
            <div className={`h-8 w-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 border border-slate-700/50`}>
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-white">{title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                <p className="text-[10px] text-slate-500 mt-1">{time}</p>
            </div>
        </div>
    )
}
