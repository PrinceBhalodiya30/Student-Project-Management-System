"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownRight, Download, FileText, Users, Briefcase, GraduationCap } from "lucide-react"

export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-6 p-6 bg-slate-950 min-h-screen text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">System Analytics</h1>
                    <p className="text-slate-400">Comprehensive data visualization of student project lifecycles.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        <FileText className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-500">
                        <Download className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
                <Select defaultValue="2023-2024">
                    <SelectTrigger className="w-[180px] bg-slate-950 border-slate-800 text-slate-300">
                        <SelectValue placeholder="Academic Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                        <SelectItem value="2022-2023">2022-2023</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px] bg-slate-950 border-slate-800 text-slate-300">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="it">Information Tech</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="fall">
                    <SelectTrigger className="w-[180px] bg-slate-950 border-slate-800 text-slate-300">
                        <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="fall">Fall 2023</SelectItem>
                        <SelectItem value="spring">Spring 2024</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Projects"
                    value="1,248"
                    change="+12%"
                    trend="up"
                    icon={Briefcase}
                    description="Across 14 departments"
                />
                <MetricCard
                    title="Active Students"
                    value="3,850"
                    change="+8%"
                    trend="up"
                    icon={Users}
                    description="84% Engagement rate"
                />
                <MetricCard
                    title="Avg. Completion Time"
                    value="4.2 mos"
                    change="-0%"
                    trend="neutral"
                    icon={FileText}
                    description="Target: 4.5 months"
                />
                <MetricCard
                    title="Successful Submissions"
                    value="94.2%"
                    change="+15%"
                    trend="up"
                    icon={GraduationCap}
                    description="Record high this semester"
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-100">Projects by Department</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Mock Bar Chart Area */}
                        <div className="h-[350px] flex items-end justify-between px-4 pb-4 gap-2">
                            {[
                                { name: 'CS', height: '80%' },
                                { name: 'MECH', height: '45%' },
                                { name: 'ELEC', height: '60%' },
                                { name: 'BIO', height: '30%' },
                                { name: 'ARTS', height: '20%' },
                                { name: 'MATH', height: '55%' },
                                { name: 'PHYS', height: '40%' }
                            ].map((dept) => (
                                <div key={dept.name} className="flex flex-col items-center gap-2 w-full group">
                                    <div
                                        className="w-full bg-blue-600/80 rounded-t-sm transition-all group-hover:bg-blue-500"
                                        style={{ height: dept.height }}
                                    ></div>
                                    <span className="text-[10px] text-slate-500 font-bold">{dept.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-100">Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Mock Donut Chart */}
                        <div className="h-[350px] flex items-center justify-center relative">
                            <div className="relative h-48 w-48 rounded-full border-[16px] border-blue-600 border-t-blue-400 border-r-green-500 border-l-amber-500">
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-white">1.2k</span>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Projects</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <LegendItem color="bg-blue-600" label="In Progress (45%)" />
                            <LegendItem color="bg-green-500" label="Completed (35%)" />
                            <LegendItem color="bg-amber-500" label="Under Review (15%)" />
                            <LegendItem color="bg-blue-400" label="Proposed (5%)" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Trends */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-100">Submission Trends</CardTitle>
                    <div className="flex gap-2">
                        <span className="flex items-center text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Drafts</span>
                        <span className="flex items-center text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Finalized</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full mt-4 relative overflow-hidden">
                        {/* CSS Wave Mockup */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
                        <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
                            <path d="M0,150 C150,100 350,200 500,100 C650,0 800,100 1000,80 L1000,200 L0,200 Z" fill="none" stroke="#3b82f6" strokeWidth="3" />
                            <path d="M0,180 C150,150 350,180 500,150 C650,120 800,160 1000,140" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5" />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] text-white">Peak: 142 Submissions</div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase font-bold px-4">
                        <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span>
                    </div>
                </CardContent>
            </Card>

            {/* Departmental Ranking Table */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-100">Departmental Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[{ name: 'Computer Science & Eng.', count: 412, rate: 88, score: '3.8/4.0', status: 'High Perf.' }, { name: 'Biotechnology', count: 185, rate: 72, score: '3.6/4.0', status: 'Stable' }].map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-0">
                                <span className="w-1/4 font-medium text-white">{d.name}</span>
                                <span className="w-1/6 text-slate-400">{d.count} Projects</span>
                                <div className="w-1/4 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${d.rate}%` }}></div>
                                    </div>
                                    <span className="text-xs text-white">{d.rate}%</span>
                                </div>
                                <span className="w-1/6 text-slate-400 text-center">{d.score}</span>
                                <span className="w-1/6 text-right"><span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] border border-green-500/20">{d.status}</span></span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function MetricCard({ title, value, change, trend, icon: Icon, description }: any) {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs flex items-center ${trend === 'up' ? 'text-green-500' : 'text-slate-500'}`}>
                        {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <span className="mr-1">~</span>}
                        {change}
                    </span>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function LegendItem({ color, label }: any) {
    return (
        <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${color}`} />
            <span className="text-[10px] text-slate-400">{label}</span>
        </div>
    )
}
