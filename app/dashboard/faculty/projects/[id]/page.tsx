"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, FileText, CheckCircle2, Clock, AlertCircle, Paperclip, Download, Plus } from "lucide-react"

export default function FacultyProjectDetailsPage() {
    const params = useParams();
    const projectId = params?.id as string;

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMilestoneUpdate = async (milestoneId: string, isCompleted: boolean) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted })
            });

            if (res.ok) {
                fetchProject(); // Refresh to show updated status
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Loading details...</div>;
    if (!project) return <div className="p-8 text-center text-slate-400">Project not found.</div>;

    const milestones = project.Milestone || [];
    const documents = project.Document || [];
    const students = project.ProjectGroup?.StudentProfile || [];

    // Calculate progress
    const completedMilestones = milestones.filter((m: any) => m.isCompleted).length;
    const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                <AdminTopBar title="Project Details" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent selection:text-white selection:bg-cyan-500/20">
                                {project.title}
                            </h1>
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">{project.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-muted-foreground max-w-2xl">{project.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-slate-700 text-slate-300">Edit Project</Button>
                        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20">Contact Team</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Progress */}
                        <Card className="glass-modern border-slate-800">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg text-foreground">Project Progress</h3>
                                        <p className="text-sm text-muted-foreground">{completedMilestones} of {milestones.length} milestones completed</p>
                                    </div>
                                    <span className="text-3xl font-bold text-cyan-400">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2 bg-slate-800" />
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="milestones" className="w-full">
                            <TabsList className="bg-slate-800/50 border border-slate-700 w-full justify-start">
                                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                            </TabsList>

                            <TabsContent value="milestones" className="mt-6 space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-slate-200">Milestone Timeline</h3>
                                    <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300"><Plus className="h-4 w-4 mr-2" /> Add Milestone</Button>
                                </div>
                                {milestones.length === 0 ? (
                                    <div className="text-center p-8 border border-dashed border-slate-800 rounded-lg text-slate-500">No milestones set</div>
                                ) : (
                                    milestones.map((milestone: any) => (
                                        <div key={milestone.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-slate-800">
                                            <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${milestone.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}
                                                onClick={() => handleMilestoneUpdate(milestone.id, !milestone.isCompleted)}>
                                                {milestone.isCompleted && <CheckCircle2 className="h-3 w-3 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className={`font-medium ${milestone.isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{milestone.title}</h4>
                                                    <Badge variant={milestone.isCompleted ? "default" : "outline"} className="text-[10px] ml-2">
                                                        {milestone.isCompleted ? 'Completed' : 'Pending'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                    <Calendar className="h-3 w-3" />
                                                    Due: {new Date(milestone.deadline).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {!milestone.isCompleted && (
                                                <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                                                    onClick={() => handleMilestoneUpdate(milestone.id, true)}>
                                                    Approve
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="documents" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {documents.length === 0 ? (
                                        <div className="col-span-full text-center p-8 border border-dashed border-slate-800 rounded-lg text-slate-500">No documents uploaded</div>
                                    ) : (
                                        documents.map((doc: any) => (
                                            <Card key={doc.id} className="glass-modern border-slate-800 hover:border-cyan-500/30 group cursor-pointer">
                                                <CardContent className="p-4 flex items-center gap-4">
                                                    <div className="p-3 rounded-lg bg-slate-800 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <h4 className="font-medium text-slate-200 truncate">{doc.name}</h4>
                                                        <p className="text-xs text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()} • {doc.type}</p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-white">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="activity">
                                <ActivityLog projectId={projectId} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Sidebar - Team */}
                    <div className="space-y-6">
                        <Card className="glass-modern border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-slate-200">Team Members</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {students.map((student: any) => (
                                    <div key={student.id} className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-slate-700">
                                            <AvatarFallback className="bg-slate-800 text-xs">
                                                {student.User?.fullName?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">{student.User?.fullName}</p>
                                            <p className="text-xs text-slate-500 truncate">{student.idNumber}</p>
                                        </div>
                                        {student.isLeader && (
                                            <Badge variant="secondary" className="text-[10px] bg-cyan-500/10 text-cyan-400">LEADER</Badge>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="glass-modern border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-slate-200">Guide</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-slate-700">
                                    <AvatarFallback className="bg-indigo-900 text-indigo-200 text-xs">
                                        {project.FacultyProfile?.User?.fullName?.substring(0, 2).toUpperCase() || "ME"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate">{project.FacultyProfile?.User?.fullName || "You"}</p>
                                    <p className="text-xs text-slate-500 truncate">{project.FacultyProfile?.designation || "Faculty Guide"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ActivityLog({ projectId }: { projectId: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/projects/${projectId}/activity`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLogs(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [projectId]);

    if (loading) return <div className="text-center p-4 text-slate-500">Loading activity access...</div>;

    if (logs.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed border-slate-800 rounded-lg text-slate-500">
                No recent activity.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <Avatar className="h-8 w-8 border border-slate-700">
                        <AvatarFallback className="bg-slate-800 text-xs text-slate-300">
                            {log.User?.fullName?.substring(0, 2).toUpperCase() || "SY"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-slate-200">
                            <span className="text-cyan-400">{log.User?.fullName}</span> {log.action.replace(/_/g, ' ').toLowerCase()}
                        </p>
                        {log.details && (
                            <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>
                        )}
                        <p className="text-[10px] text-slate-600 mt-2">
                            {new Date(log.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
