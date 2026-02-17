"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FolderKanban, MoreVertical, Loader2, Search, Users, Calendar, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FacultyProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/faculty/projects');
                if (res.ok) {
                    const data = await res.json();
                    setProjects(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                <AdminTopBar title="My Projects" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full relative z-10">
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent selection:text-white selection:bg-cyan-500/20">
                                My Assigned Projects
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and track the progress of projects under your guidance.
                            </p>
                        </div>
                        <Button onClick={() => { }} className="bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/20 hidden">
                            Export Report
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card className="glass-modern border-cyan-500/20">
                        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search projects..."
                                    className="pl-10 bg-slate-950/50 border-slate-700 focus:border-cyan-500/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-slate-950/50 border-slate-700">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700">
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="PROPOSED">Proposed</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project, index) => (
                            <Card
                                key={project.id}
                                className="glass-modern border-slate-800 hover:border-cyan-500/30 transition-all hover-scale group cursor-pointer stagger-item"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => router.push(`/dashboard/faculty/projects/${project.id}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className={`border-cyan-500/30 text-cyan-400 bg-cyan-500/10`}>
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">{project.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">{project.description}</p>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                                                <Users className="h-3 w-3" /> Team
                                            </p>
                                            <div className="flex -space-x-2">
                                                {project.ProjectGroup?.StudentProfile?.slice(0, 4).map((student: any) => (
                                                    <Avatar key={student.id} className="h-8 w-8 border-2 border-background" title={student.User?.fullName}>
                                                        <AvatarFallback className="bg-slate-800 text-xs">
                                                            {student.User?.fullName?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {(!project.ProjectGroup?.StudentProfile || project.ProjectGroup.StudentProfile.length === 0) && (
                                                    <span className="text-sm text-slate-500 italic">No members</span>
                                                )}
                                                {(project.ProjectGroup?.StudentProfile?.length || 0) > 4 && (
                                                    <div className="h-8 w-8 rounded-full bg-slate-800 border-2 border-background flex items-center justify-center text-[10px] text-slate-400">
                                                        +{project.ProjectGroup.StudentProfile.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(project.updatedAt).toLocaleDateString()}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-0 h-auto font-normal"
                                            >
                                                Details <ChevronRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredProjects.length === 0 && (
                            <div className="col-span-full text-center py-12 glass-modern rounded-xl border-dashed border-slate-700">
                                <FolderKanban className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-300">No Projects Found</h3>
                                <p className="text-slate-500 mt-2">Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
