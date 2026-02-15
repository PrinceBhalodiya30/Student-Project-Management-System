"use client"

import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FolderKanban, MoreVertical, Calendar } from "lucide-react"

export default function FacultyProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/faculty/projects')
            .then(res => res.json())
            .then(data => setProjects(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                <AdminTopBar title="My Projects" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full relative z-10">
                <h1 className="text-3xl font-bold mb-8 gradient-primary bg-clip-text text-transparent selection:text-white selection:bg-cyan-500/20">
                    My Assigned Projects
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Card key={project.id} className="glass-modern border-slate-800 hover:border-cyan-500/30 transition-all hover-scale group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                                        {project.status.replace('_', ' ')}
                                    </Badge>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{project.description}</p>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Team Members</p>
                                        <div className="flex -space-x-2">
                                            {project.ProjectGroup?.StudentProfile?.map((student: any) => (
                                                <Avatar key={student.id} className="h-8 w-8 border-2 border-background" title={student.User?.fullName}>
                                                    <AvatarFallback className="bg-slate-800 text-xs">
                                                        {student.User?.fullName?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-xs text-slate-500">
                                            Last active: {new Date(project.updatedAt).toLocaleDateString()}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                                            onClick={() => window.location.href = `/dashboard/faculty/projects/${project.id}`}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No projects found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
