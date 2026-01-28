"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, FileText, GraduationCap, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"

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
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100 flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Reports</h1>
                    <p className="text-slate-400">Overview of project statuses and student activity.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.open('/api/reports/export?type=projects', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" /> Export Projects
                    </button>
                    <button
                        onClick={() => window.open('/api/reports/export?type=students', '_blank')}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Export Students
                    </button>
                </div>
            </div>

            {/* 1. Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Projects"
                    value={loading ? "..." : data?.metrics?.totalProjects}
                    icon={Briefcase}
                    subtext="Across all depts"
                />
                <StatCard
                    title="Active Students"
                    value={loading ? "..." : data?.metrics?.activeStudents}
                    icon={Users}
                    subtext="Currently enrolled"
                />
                <StatCard
                    title="Avg Completion"
                    value={loading ? "..." : data?.metrics?.avgCompletionTime}
                    icon={FileText}
                    subtext="Target: < 5 Months"
                />
                <StatCard
                    title="Success Rate"
                    value={loading ? "..." : data?.metrics?.successRate}
                    icon={GraduationCap}
                    subtext="Based on submissions"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2. Department Summary */}
                <Card className="bg-[#1e293b] border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Department Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-slate-500 font-normal">Loading departments...</div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {data?.charts?.byDepartment?.map((dept: any) => (
                                    <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                                        <span className="font-medium text-slate-300">{dept.name}</span>
                                        <span className="text-xl font-bold text-white">{dept.count} <span className="text-sm font-normal text-slate-500">Projects</span></span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Recent Activity Log */}
                <Card className="bg-[#1e293b] border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-hidden rounded-md">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-900 text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Project</th>
                                        <th className="px-4 py-3">Update</th>
                                        <th className="px-4 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {loading ? (
                                        <tr><td colSpan={3} className="p-6 text-center text-slate-500">Loading activity...</td></tr>
                                    ) : data?.recentActivity?.length === 0 ? (
                                        <tr><td colSpan={3} className="p-6 text-center text-slate-500">No activity found.</td></tr>
                                    ) : (
                                        data?.recentActivity?.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{item.project}</td>
                                                <td className="px-4 py-3 text-slate-400">{item.desc}</td>
                                                <td className="px-4 py-3 text-right text-slate-500">{item.date}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, subtext }: any) {
    return (
        <Card className="bg-[#1e293b] border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className="text-xs text-slate-500 mt-1">{subtext}</p>
            </CardContent>
        </Card>
    )
}
