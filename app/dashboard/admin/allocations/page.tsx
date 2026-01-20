"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Calendar, ChevronDown, MoreVertical, Star, AlertTriangle } from "lucide-react"

export default function AllocationsPage() {
    const [data, setData] = useState<{ unassignedProjects: any[], faculty: any[] }>({ unassignedProjects: [], faculty: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAllocations() {
            try {
                const res = await fetch('/api/allocations');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch allocations", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAllocations();
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            className="bg-[#1e293b] border-none pl-10 text-slate-300 placeholder:text-slate-500"
                            placeholder="Search projects, faculty, or skills..."
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-[#1e293b] border-slate-700 text-slate-300">
                        Computer Science <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="bg-[#1e293b] border-slate-700 text-slate-300">
                        <Calendar className="mr-2 h-4 w-4" /> Session 2024-25
                    </Button>
                    <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-slate-500 font-bold uppercase">Auto-Match Tool:</span>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-xs">
                            <Star className="mr-2 h-3 w-3" /> Smart Allocate
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left Col: Unassigned Projects */}
                <div className="w-1/3 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-white">Unassigned Projects</h2>
                            <Badge className="bg-blue-900/50 text-blue-400 border-blue-800">{loading ? "..." : data.unassignedProjects.length} PENDING</Badge>
                        </div>
                        <button className="text-xs text-blue-400 hover:underline">Sort by Priority</button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {loading ? (
                            <div className="text-center text-slate-500 mt-10">Loading projects...</div>
                        ) : data.unassignedProjects.map((p) => (
                            <UnassignedProjectCard
                                key={p.id}
                                id={`#${p.id.split('-').pop()}`} // Mock short ID
                                title={p.title}
                                groupSize={3} // Mock
                                tags={["General"]} // Mock logic
                            />
                        ))}

                        {/* Alert Box - Static for Demo */}
                        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-red-500">Expertise Alert</h4>
                                <p className="text-xs text-red-400/80 mt-1">Project #PRJ-8821 requires 'TensorFlow' which is not in Dr. Anderson's primary skills.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between text-xs text-slate-500 font-medium">
                        <span>Total Unassigned: <span className="text-white">{data.unassignedProjects.length} Projects</span></span>
                        <span>Open Slots: <span className="text-green-500">28 Slots</span></span>
                    </div>
                </div>

                {/* Right Col: Faculty Availability */}
                <div className="flex-1 flex flex-col bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-white">Faculty Availability</h2>
                            <span className="text-xs text-slate-500">Showing {data.faculty.length} Guides in CSE</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-green-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Available</span>
                            <span className="flex items-center gap-1.5 text-amber-500"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Moderate</span>
                            <span className="flex items-center gap-1.5 text-red-500"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Full</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800/50">
                            <div className="col-span-4">Faculty Member</div>
                            <div className="col-span-3">Expertise</div>
                            <div className="col-span-3">Workload</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {loading ? (
                            <div className="text-center text-slate-500 mt-10">Loading availability...</div>
                        ) : data.faculty.map((f) => (
                            <FacultyRow
                                key={f.id}
                                initials={f.name.substring(0, 2).toUpperCase()}
                                color="bg-slate-600"
                                name={f.name}
                                role={f.role || "Professor"}
                                tags={f.expertise || []}
                                load={f.currentLoad}
                                maxLoad={f.maxLoad}
                                status={f.currentLoad >= f.maxLoad ? 'full' : f.currentLoad >= 3 ? 'moderate' : 'available'}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-4 pt-4 border-t border-slate-800">
                <Button variant="outline" className="border-slate-700 text-slate-300">Reset All Changes</Button>
                <Button className="bg-blue-600 hover:bg-blue-500 px-8">Finalize Allocations</Button>
            </div>
        </div>
    )
}

function UnassignedProjectCard({ id, title, groupSize, tags }: any) {
    return (
        <Card className="bg-[#1e293b] border-slate-800 p-4 hover:border-slate-700 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-slate-500 font-mono">{id}</span>
                <MoreVertical className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{title}</h3>
            <p className="text-xs text-slate-400 mb-3">Group: {groupSize} Students | ID: S24-012</p>
            <div className="flex gap-2">
                {tags.map((t: string) => (
                    <Badge key={t} variant="secondary" className="bg-slate-800 text-slate-400 text-[10px] border-slate-700">{t}</Badge>
                ))}
            </div>
        </Card>
    )
}

function FacultyRow({ initials, color, name, role, tags, load, maxLoad, status, warning, capacityFull, highlight }: any) {
    return (
        <div className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-800/50 ${highlight ? "bg-blue-500/5 border-l-2 border-l-blue-500" : ""}`}>
            <div className="col-span-4 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${color} text-white font-bold`}>{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-xs text-slate-500">{role}</div>
                </div>
            </div>
            <div className="col-span-3 flex gap-2 flex-wrap">
                {tags.map((t: string) => (
                    <Badge key={t} variant="outline" className="border-slate-700 text-slate-400 text-[10px] bg-slate-900/50">{t}</Badge>
                ))}
            </div>
            <div className="col-span-3 flex items-center gap-3">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div
                            key={i}
                            className={`h-3 w-3 rounded-full ${i <= load
                                ? (status === 'full' ? 'bg-slate-600' : (status === 'moderate' ? 'bg-slate-300' : 'bg-white'))
                                : 'bg-slate-800'}`}
                        />
                    ))}
                </div>
                <span className="text-sm font-bold text-white">{load} / {maxLoad}</span>
                {status === 'available' && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
                {status === 'moderate' && <div className="h-2 w-2 rounded-full bg-amber-500"></div>}
                {status === 'full' && <div className="h-2 w-2 rounded-full bg-red-500"></div>}
            </div>
            <div className="col-span-2 text-right">
                {highlight ? (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs h-8">
                        Drop Project Here
                    </Button>
                ) : warning ? (
                    <AlertTriangle className="ml-auto h-5 w-5 text-amber-500" />
                ) : capacityFull ? (
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Capacity Full</span>
                ) : null}
            </div>
        </div>
    )
}
