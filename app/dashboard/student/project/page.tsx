"use client"

import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, FileText, Download, Users, AlertCircle, Plus, Loader2, Sparkles, Send } from "lucide-react"

export default function MyProjectPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Form States
    const [groupName, setGroupName] = useState("")
    const [memberId, setMemberId] = useState("") // Input for adding member
    const [membersList, setMembersList] = useState<string[]>([]) // List of IDs to add

    const [projectTitle, setProjectTitle] = useState("")
    const [projectDesc, setProjectDesc] = useState("")

    useEffect(() => {
        fetchProject()
    }, [])

    const fetchProject = async () => {
        try {
            const res = await fetch('/api/student/project')
            if (res.ok) {
                const json = await res.json()
                setData(json)
            } else {
                // 404 means no project/group, but user is authorized.
                setData(null)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddMember = () => {
        if (memberId.trim()) {
            setMembersList([...membersList, memberId.trim()])
            setMemberId("")
        }
    }

    const handleCreateGroup = async () => {
        if (!groupName) return;
        try {
            const res = await fetch('/api/student/group/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupName, members: membersList })
            })
            if (res.ok) fetchProject()
            else alert("Failed to create group. Check member IDs.")
        } catch (e) { console.error(e) }
    }

    const handleSubmitProposal = async () => {
        if (!projectTitle || !projectDesc) return;
        try {
            const res = await fetch('/api/student/project/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: projectTitle, description: projectDesc })
            })
            if (res.ok) fetchProject()
            else alert("Failed to submit proposal.")
        } catch (e) { console.error(e) }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        )
    }

    // Case 1: No Project & No Group -> Show Group Creation
    if (!data) {
        return (
            <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
                {/* Animated Background */}
                <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
                <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

                <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                    <AdminTopBar title="My Project" />
                </div>

                <div className="flex-1 p-8 flex flex-col items-center justify-center gap-8 relative z-10">
                    <div className="text-center animate-slide-down">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/10 mb-4 ring-1 ring-cyan-500/30">
                            <Users className="h-8 w-8 text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">Start Your Journey</h2>
                        <p className="text-slate-400">Form a team to begin your project work.</p>
                    </div>

                    <Card className="glass-modern border-slate-800 w-full max-w-lg animate-slide-up">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Create Group</CardTitle>
                            <CardDescription className="text-slate-400">
                                You will be the group leader. Add valid Student IDs (e.g., 2024IT005).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block text-slate-300">Group Name</label>
                                <Input
                                    placeholder="e.g. The Innovators"
                                    className="bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500/50"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block text-slate-300">Add Members (by ID Number)</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Student ID (e.g. 21IT045)"
                                        className="bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500/50"
                                        value={memberId}
                                        onChange={e => setMemberId(e.target.value)}
                                    />
                                    <Button variant="outline" onClick={handleAddMember} className="border-slate-700 text-cyan-400 hover:bg-slate-800 hover:text-cyan-300">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {membersList.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {membersList.map((m, i) => (
                                            <Badge key={i} variant="secondary" className="bg-cyan-900/30 text-cyan-200 border-cyan-500/20">
                                                {m}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20" onClick={handleCreateGroup}>
                                Create Group
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }

    const { project, group, members } = data

    // Case 2: Group Exists but No Project -> Show Proposal Form
    if (!project) {
        return (
            <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
                {/* Animated Background */}
                <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
                <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

                <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                    <AdminTopBar title="My Project" />
                </div>

                <div className="flex-1 p-8 flex flex-col items-center justify-center gap-8 relative z-10 overflow-y-auto">

                    <div className="text-center animate-slide-down">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 mb-4 ring-1 ring-emerald-500/30">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Group Created: <span className="text-cyan-400">{group.name}</span></h2>
                        <p className="text-slate-400">Your team is ready. Now submit your project proposal.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl animate-slide-up">
                        {/* Team Info */}
                        <Card className="glass-modern border-slate-800 h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg text-white">Team Members</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <Avatar className="h-10 w-10 border border-slate-700">
                                            <AvatarFallback className="bg-slate-800 text-cyan-400 text-xs font-bold">
                                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate flex items-center gap-2">
                                                {member.name}
                                                {member.isLeader && <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10 px-1.5 py-0">Leader</Badge>}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Proposal Form */}
                        <Card className="glass-modern border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-400" />
                                    Submit Proposal
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Describe your project idea for faculty approval.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block text-slate-300">Project Title</label>
                                    <Input
                                        className="bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500/50"
                                        value={projectTitle}
                                        onChange={e => setProjectTitle(e.target.value)}
                                        placeholder="Enter a descriptive title"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block text-slate-300">Description</label>
                                    <Textarea
                                        className="bg-slate-900/50 border-slate-700 text-white h-32 focus:border-cyan-500/50 resize-none"
                                        value={projectDesc}
                                        onChange={e => setProjectDesc(e.target.value)}
                                        placeholder="Outline the problem, objective, and scope..."
                                    />
                                </div>
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20" onClick={handleSubmitProposal}>
                                    Submit Proposal <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // Case 3: Project Exists (Existing UI)
    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                <AdminTopBar title="My Project" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full relative z-10 animate-slide-up">

                {/* Project Header */}
                <Card className="overflow-hidden border-none bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-slate-800 shadow-xl relative group">
                    <div className="absolute top-0 right-0 p-24 bg-cyan-500/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
                    <CardHeader className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 px-3 py-1">
                                    {project.status.replace('_', ' ')}
                                </Badge>
                                <CardTitle className="text-3xl font-bold text-white tracking-tight">{project.title}</CardTitle>
                                <CardDescription className="text-slate-300 mt-3 max-w-3xl leading-relaxed">
                                    {project.description}
                                </CardDescription>
                            </div>
                            <div className="text-right hidden md:block bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Project Group</p>
                                <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{group.name}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-0">
                        <Separator className="bg-white/10 my-4" />
                        <div className="flex items-center gap-6 text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-cyan-500" />
                                <span>{members.length} Members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-cyan-500" />
                                <span>Guide: <span className="text-white font-medium">{project.guide?.user?.fullName || "Not Assigned"}</span></span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Milestones & Docs */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Milestones */}
                        <Card className="glass-modern border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-cyan-400" />
                                    Milestones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {project.milestones.map((m: any) => (
                                    <div key={m.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-slate-700/50 hover:bg-white/10 transition-colors">
                                        <div className={`mt-1 p-1.5 rounded-full ${m.isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700 text-slate-400'}`}>
                                            {m.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`font-medium ${m.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>{m.title}</h4>
                                                <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">{new Date(m.deadline).toLocaleDateString()}</Badge>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1 mb-3">{m.description || "No description"}</p>

                                            {!m.isCompleted && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-xs h-8 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`/api/student/project/milestones/${m.id}`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ isCompleted: true })
                                                            });
                                                            if (res.ok) fetchProject();
                                                        } catch (e) {
                                                            console.error("Failed to update milestone", e);
                                                        }
                                                    }}
                                                >
                                                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark as Completed
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {project.milestones.length === 0 && (
                                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                                        <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                        <p>No milestones defined yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card className="glass-modern border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-purple-400" />
                                        Project Documents
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const formData = new FormData();
                                                formData.append("file", file);

                                                try {
                                                    // setLoading(true); // Should probably use a specific loading state
                                                    const res = await fetch('/api/student/project/documents', {
                                                        method: 'POST',
                                                        body: formData
                                                    });
                                                    if (res.ok) {
                                                        fetchProject(); // Refresh list
                                                    } else {
                                                        alert("Upload failed");
                                                    }
                                                } catch (error) {
                                                    console.error(error);
                                                    alert("Error uploading file");
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-slate-700 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30"
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Download className="mr-2 h-4 w-4 rotate-180" /> Upload New</>}
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {project.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-slate-800 hover:bg-white/10 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">{doc.name}</p>
                                                <p className="text-xs text-slate-400">{new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    </div>
                                ))}
                                {project.documents.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No documents uploaded.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column: Team Members */}
                    <div className="space-y-6">
                        <Card className="glass-modern border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-400" />
                                    Team Members
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <Avatar className="h-9 w-9 border border-slate-700">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xs font-bold">
                                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate flex items-center gap-2">
                                                {member.name}
                                                {member.isLeader && <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10 px-1.5 py-0">Leader</Badge>}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/20 text-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8 pointer-events-none"></div>
                            <CardContent className="p-6 relative z-10">
                                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-indigo-400" />
                                    Guide Note
                                </h4>
                                <p className="text-sm text-slate-300 italic">
                                    "Please ensure the Phase 1 documentation is uploaded by Friday. Good progress so far."
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
