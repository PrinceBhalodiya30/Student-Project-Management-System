"use client"

import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"

export default function FacultyEvaluationsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/faculty/projects');
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const proposedProjects = projects.filter(p => p.status === 'PROPOSED');
    const activeProjects = projects.filter(p => ['APPROVED', 'IN_PROGRESS'].includes(p.status));

    const handleStatusUpdate = async (projectId: string, newStatus: string) => {
        // We need an API for this. reusing existing update API or creating new one?
        // Usually /api/projects/[id] allows updates. 
        // Let's assume we can call PUT /api/projects/[id] with status.
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Determine user-friendly validation message based on success
                const message = newStatus === 'APPROVED' ?
                    "Project approved successfully!" :
                    newStatus === 'REJECTED' ?
                        "Project rejected." :
                        "Project status updated.";

                // Use a simple alert if toast is not available, or toast if it is.
                // Assuming no toast for now to be safe, just refresh.
                alert(message);
                fetchProjects();
            } else {
                console.error("Failed to update status");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                <AdminTopBar title="Evaluations" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                        Project Evaluations
                    </h1>
                </div>

                <Tabs defaultValue="approvals" className="w-full">
                    <TabsList className="bg-slate-800/50 border border-slate-700">
                        <TabsTrigger value="approvals" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                            Project Approvals
                            {proposedProjects.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{proposedProjects.length}</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                            Milestone Reviews
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="approvals" className="mt-6 space-y-4">
                        {proposedProjects.length === 0 ? (
                            <div className="text-center p-12 glass-modern rounded-xl border-dashed border-slate-700">
                                <CheckCircle2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No new project proposals pending approval.</p>
                            </div>
                        ) : (
                            proposedProjects.map(project => (
                                <Card key={project.id} className="glass-modern border-slate-800">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-foreground">{project.title}</h3>
                                                    <Badge variant="outline" className="border-amber-500/30 text-amber-400">Decision Pending</Badge>
                                                </div>
                                                <p className="text-muted-foreground mb-4">{project.description}</p>
                                                <div className="flex items-center gap-6 text-sm text-slate-500">
                                                    <div>
                                                        <span className="font-semibold text-slate-400 block text-xs uppercase">Type</span>
                                                        {project.Type?.name}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-400 block text-xs uppercase">Submitted</span>
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 min-w-[150px] justify-center">
                                                <Button
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={() => handleStatusUpdate(project.id, 'APPROVED')}
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="bg-red-900/50 hover:bg-red-900 border border-red-800"
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

                    <TabsContent value="reviews" className="mt-6">
                        <div className="text-center p-12 glass-modern rounded-xl border-dashed border-slate-700">
                            <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Milestone review feature under development.</p>
                            <p className="text-xs text-slate-600 mt-2">Checking milestones for {activeProjects.length} active projects...</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
