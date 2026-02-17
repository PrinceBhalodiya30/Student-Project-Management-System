"use client"

import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, Calendar, Loader2 } from "lucide-react"

export default function FacultyEvaluationsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/faculty/projects');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setProjects(data);
            }
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const proposedProjects = projects.filter(p => p.status === 'PROPOSED');
    const pendingMilestones = projects.flatMap(p =>
        (p.Milestone || [])
            .filter((m: any) => !m.isCompleted)
            .map((m: any) => ({ ...m, projectName: p.title, projectId: p.id }))
    ).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    const handleStatusUpdate = async (projectId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchProjects();
            } else {
                alert("Failed to update status. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        }
    };

    const handleMilestoneApprove = async (projectId: string, milestoneId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: true })
            });

            if (res.ok) {
                fetchProjects();
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                <AdminTopBar title="Evaluations" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent selection:text-white selection:bg-cyan-500/20">
                        Project Evaluations
                    </h1>
                    <p className="text-muted-foreground mt-1">Review project proposals and mark milestones as complete.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    </div>
                ) : (
                    <Tabs defaultValue="approvals" className="w-full space-y-6">
                        <TabsList className="bg-slate-950/50 border border-slate-700 p-1 w-full max-w-[400px] grid grid-cols-2">
                            <TabsTrigger value="approvals" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                                Project Approvals
                                {proposedProjects.length > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{proposedProjects.length}</span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                                Milestone Reviews
                                {pendingMilestones.length > 0 && (
                                    <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingMilestones.length}</span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="approvals" className="space-y-4 animate-slide-up">
                            {proposedProjects.length === 0 ? (
                                <div className="text-center p-12 glass-modern rounded-xl border-dashed border-slate-700">
                                    <CheckCircle2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 font-medium">No new project proposals pending approval.</p>
                                    <p className="text-slate-500 text-sm mt-1">New proposals assigned to you will appear here.</p>
                                </div>
                            ) : (
                                proposedProjects.map(project => (
                                    <Card key={project.id} className="glass-modern border-slate-800 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-foreground">{project.title}</h3>
                                                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">Decision Pending</Badge>
                                                    </div>
                                                    <p className="text-muted-foreground mb-4 leading-relaxed">{project.description}</p>

                                                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 bg-slate-900/40 p-3 rounded-lg border border-slate-800/50 w-fit">
                                                        <div>
                                                            <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Type</span>
                                                            <span className="text-slate-200">{project.Type?.name || 'N/A'}</span>
                                                        </div>
                                                        <div className="w-px h-8 bg-slate-700" />
                                                        <div>
                                                            <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Submitted</span>
                                                            <span className="text-slate-200">{new Date(project.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-3 min-w-[150px] justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                                                    <Button
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                                                        onClick={() => handleStatusUpdate(project.id, 'APPROVED')}
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/30"
                                                        onClick={() => handleStatusUpdate(project.id, 'REJECTED')}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="reviews" className="space-y-4 animate-slide-up">
                            {pendingMilestones.length === 0 ? (
                                <div className="text-center p-12 glass-modern rounded-xl border-dashed border-slate-700">
                                    <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 font-medium">No pending milestones to review.</p>
                                    <p className="text-slate-500 text-sm mt-1">Milestones marked for review by students will appear here.</p>
                                </div>
                            ) : (
                                pendingMilestones.map((milestone: any, index: number) => (
                                    <Card key={milestone.id} className="glass-modern border-slate-800 hover:border-cyan-500/30 transition-all stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-lg text-slate-200">{milestone.title}</h4>
                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[10px]">Milestone</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                    <span className="text-cyan-400 font-medium">{milestone.projectName}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded">
                                                        <Calendar className="h-3 w-3 text-amber-500" />
                                                        Due: {new Date(milestone.deadline).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 whitespace-nowrap w-full md:w-auto"
                                                onClick={() => handleMilestoneApprove(milestone.projectId, milestone.id)}
                                            >
                                                <CheckCircle2 className="mr-2 h-3 w-3" /> Mark Complete
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    )
}
