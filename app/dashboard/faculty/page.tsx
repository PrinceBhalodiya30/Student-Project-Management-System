"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, Settings, MoreVertical, Calendar, Clock, Filter, ListFilter, AlertCircle, Folder, MapPin } from "lucide-react"

export default function FacultyDashboard() {
    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 font-sans">
            {/* Top Bar for Faculty */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-[#0f172a]">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        className="w-full bg-[#1e293b] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Search projects or students..."
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-semibold text-white">Dr. Sarah Smith</div>
                            <div className="text-xs text-slate-400">Senior Professor</div>
                        </div>
                        <Avatar>
                            <AvatarImage src="/avatars/02.png" />
                            <AvatarFallback>SS</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <MetricCard
                            title="Active Projects"
                            value="12"
                            subtext="+2 this month"
                            subtextColor="text-green-500"
                            icon={<Folder className="h-5 w-5 text-blue-500" />}
                        />
                        <MetricCard
                            title="Meetings Today"
                            value="4"
                            subtext="Next: 2:00 PM"
                            subtextColor="text-slate-400"
                            icon={<Calendar className="h-5 w-5 text-amber-500" />}
                        />
                        <MetricCard
                            title="Pending Reviews"
                            value="7"
                            subtext="3 overdue"
                            subtextColor="text-red-500"
                            icon={<AlertCircle className="h-5 w-5 text-red-500" />}
                        />
                    </div>

                    {/* Assigned Projects Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Assigned Projects</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-[#1e293b] border-slate-700 text-slate-300 gap-2">
                                <Filter className="h-3 w-3" /> Filter
                            </Button>
                            <Button variant="outline" size="sm" className="bg-[#1e293b] border-slate-700 text-slate-300 gap-2">
                                <ListFilter className="h-3 w-3" /> Sort
                            </Button>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <ProjectCard
                            tag="PHASE 3: IMPLEMENTATION"
                            tagColor="bg-blue-600/20 text-blue-400"
                            title="AI-Driven Logistics Optimization"
                            students="Lead Students: Alice Wang, Bob Richards"
                            progress={85}
                            nextMeeting="2H 15M"
                            avatars={["AW", "BR"]}
                        />
                        <ProjectCard
                            tag="PHASE 1: PROPOSAL"
                            tagColor="bg-amber-600/20 text-amber-500"
                            title="Blockchain in Supply Chain"
                            students="Lead Students: Charlie Davis, Eva Lopez"
                            progress={32}
                            nextMeeting="TOMORROW"
                            avatars={["CD", "EL"]}
                        />
                        <ProjectCard
                            tag="FINAL REVIEW"
                            tagColor="bg-green-600/20 text-green-500"
                            title="Smart City Infrastructure"
                            students="Lead Students: Grace Kim, Henry O."
                            progress={98}
                            status="PRESENTATION READY"
                            statusColor="text-green-500"
                            avatars={["GK", "HO"]}
                        />
                        <ProjectCard
                            tag="PHASE 2: RESEARCH"
                            tagColor="bg-slate-600/20 text-slate-400"
                            title="Cybersecurity Frameworks"
                            students="Lead Students: Frank Miller"
                            progress={64}
                            nextMeeting="3 DAYS"
                            avatars={["FM"]}
                        />
                    </div>
                </main>

                {/* Right Sidebar - Upcoming Meetings */}
                <aside className="w-80 bg-[#1e293b] border-l border-slate-800 p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-white">Upcoming Meetings</h3>
                        <Calendar className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-6">
                        {/* Today */}
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Today - Oct 24</div>
                            <MeetingItem
                                title="Thesis Review (Group A)"
                                time="2:00 PM - 3:00 PM"
                                active={true}
                            />
                            <MeetingItem
                                title="Logistics Optimization Sync"
                                time="4:30 PM - 5:00 PM"
                            />
                        </div>

                        {/* Tomorrow */}
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tomorrow - Oct 25</div>
                            <MeetingItem
                                title="Initial Pitch (Group D)"
                                time="10:00 AM - 11:30 AM"
                                location="Room 402B"
                                highlightColor="border-amber-500"
                            />
                        </div>

                        {/* Wed */}
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Wed - Oct 26</div>
                            <MeetingItem
                                title="Final Demo Prep"
                                time="01:00 PM - 02:00 PM"
                                highlightColor="border-green-500"
                            />
                        </div>
                    </div>

                    {/* Office Hours Card */}
                    <div className="mt-8 p-4 bg-[#0f172a] rounded-xl border border-slate-800">
                        <h4 className="text-sm font-semibold text-white mb-1">Office Hours</h4>
                        <p className="text-xs text-slate-400 mb-3">You have 3 open slots for student consultations this week.</p>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs">
                            Manage Slots
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    )
}

function MetricCard({ title, value, subtext, subtextColor, icon }: any) {
    return (
        <Card className="bg-[#1e293b] border-slate-800">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-sm font-medium">{title}</span>
                    {icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className={`text-xs font-medium ${subtextColor} flex items-center gap-1`}>
                    {subtext.includes("overdue") && <AlertCircle className="h-3 w-3" />}
                    {subtext.includes("this month") && <span className="text-lg leading-3">↗</span>}
                    {subtext}
                </div>
            </CardContent>
        </Card>
    )
}

function ProjectCard({ tag, tagColor, title, students, progress, nextMeeting, status, statusColor, avatars }: any) {
    return (
        <Card className="bg-[#1e293b] border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className={`${tagColor} text-[10px] uppercase font-bold border-none`}>{tag}</Badge>
                    <MoreVertical className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{title}</h3>
                <p className="text-xs text-slate-400 mb-6">{students}</p>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span className="uppercase tracking-wider font-semibold">Progress</span>
                        <span className="font-bold text-blue-400">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-slate-700" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        {status ? (
                            <div className={`flex items-center gap-1.5 font-bold ${statusColor}`}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {status}
                            </div>
                        ) : (
                            <>
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="uppercase text-[10px] font-semibold tracking-wider text-slate-500">Next Meeting:</span>
                                <span className="font-medium text-white">{nextMeeting}</span>
                            </>
                        )}
                    </div>
                    <div className="flex -space-x-2">
                        {avatars.map((av: string, i: number) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-[#1e293b]">
                                <AvatarFallback className="text-[9px] bg-slate-600 text-white">{av}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function MeetingItem({ title, time, active, location, highlightColor = "border-blue-500" }: any) {
    return (
        <div className={`pl-3 border-l-2 ${active ? "border-blue-500" : highlightColor === "border-blue-500" ? "border-slate-700" : highlightColor} mb-4 relative`}>
            {active && <div className="absolute -left-[5px] top-0 h-full w-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
            <h4 className={`text-sm font-medium ${active ? "text-white" : "text-slate-300"}`}>{title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{time}</p>
            {active && (
                <div className="mt-2 flex gap-2">
                    <Button size="sm" className="h-6 text-[10px] bg-blue-600 hover:bg-blue-500">Join Call</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-slate-600 text-slate-400">Details</Button>
                </div>
            )}
            {location && (
                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                    <MapPin className="h-3 w-3" /> {location}
                </div>
            )}
        </div>
    )
}

// Missing icon import hack
function CheckCircle2(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
}
