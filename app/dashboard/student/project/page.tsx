"use client"

import { useEffect, useState } from "react"
import { TopBar } from "@/components/dashboard/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, FileText, Download, Users, AlertCircle, Plus, UserPlus } from "lucide-react"

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

    if (loading) return <div className="p-8 text-white">Loading project details...</div>

    // Case 1: No Project & No Group -> Show Group Creation
    if (!data) {
        return (
            <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 font-sans">
                <TopBar title="My Project" />
                <div className="p-8 flex flex-col items-center justify-center h-full gap-8">

                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Start Your Journey</h2>
                        <p className="text-slate-400">Form a team to begin your project work.</p>
                    </div>

                    <Card className="bg-slate-900 border-slate-800 w-full max-w-lg">
                        <CardHeader>
                            <CardTitle className="text-xl">Create Group</CardTitle>
                            <CardDescription className="text-slate-400">
                                You will be the group leader. Add valid Student IDs (e.g., 2024IT005).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Group Name</label>
                                <Input
                                    placeholder="e.g. The Innovators"
                                    className="bg-slate-800 border-slate-700 text-white"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Add Members (by ID Number)</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Student ID (e.g. 21IT045)"
                                        className="bg-slate-800 border-slate-700 text-white"
                                        value={memberId}
                                        onChange={e => setMemberId(e.target.value)}
                                    />
                                    <Button variant="outline" onClick={handleAddMember} className="border-slate-700 text-cyan-400 hover:bg-slate-800">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {membersList.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {membersList.map((m, i) => (
                                            <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                                                {m}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCreateGroup}>
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
    // (We distinguish by checking if 'project' object exists inside data. 
    // The API returns { project, group, members }. If project is null, then this case.)
    if (!project) {
        return (
            <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 font-sans">
                <TopBar title="My Project" />
                <div className="p-8 flex flex-col items-center justify-center h-full gap-8 overflow-y-auto">

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Group Created: <span className="text-cyan-400">{group.name}</span></h2>
                        <p className="text-slate-400">Your team is ready. Now submit your project proposal.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                        {/* Team Info */}
                        <Card className="bg-slate-900 border-slate-800 h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg">Team Members</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-slate-700">
                                            <AvatarFallback className="bg-slate-800 text-cyan-400 text-xs">
                                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {member.name}
                                                {member.isLeader && <span className="ml-2 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Leader</span>}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Proposal Form */}
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-xl">Submit Proposal</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Describe your project idea for faculty approval.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Project Title</label>
                                    <Input
                                        className="bg-slate-800 border-slate-700 text-white"
                                        value={projectTitle}
                                        onChange={e => setProjectTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Description</label>
                                    <Textarea
                                        className="bg-slate-800 border-slate-700 text-white h-32"
                                        value={projectDesc}
                                        onChange={e => setProjectDesc(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitProposal}>
                                    Submit Proposal
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
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 font-sans">
            <TopBar title="My Project" />
            <main className="flex-1 overflow-y-auto p-8 space-y-6">

                {/* Project Header */}
                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-800">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className="mb-2 bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
                                    {project.status.replace('_', ' ')}
                                </Badge>
                                <CardTitle className="text-2xl font-bold text-white">{project.title}</CardTitle>
                                <CardDescription className="text-slate-400 mt-2 max-w-3xl">
                                    {project.description}
                                </CardDescription>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-sm text-slate-400">Project Group</p>
                                <p className="text-lg font-semibold text-cyan-400">{group.name}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6 text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-cyan-500" />
                                <span>{members.length} Members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-cyan-500" />
                                <span>Guide: {project.guide?.user?.fullName || "Not Assigned"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Milestones & Docs */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Milestones */}
                        <Card className="bg-slate-900 border-slate-800 text-slate-100">
                            <CardHeader>
                                <CardTitle className="text-lg">Milestones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {project.milestones.map((m: any) => (
                                    <div key={m.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <div className={`mt-1 p-1 rounded-full ${m.isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700 text-slate-400'}`}>
                                            {m.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="font-medium text-white">{m.title}</h4>
                                                <span className="text-xs text-slate-400">{new Date(m.deadline).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">{m.description || "No description"}</p>
                                        </div>
                                    </div>
                                ))}
                                {project.milestones.length === 0 && (
                                    <p className="text-slate-500 text-sm text-center py-4">No milestones defined yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card className="bg-slate-900 border-slate-800 text-slate-100">
                            <CardHeader>
                                <CardTitle className="text-lg flex justify-between items-center">
                                    <span>Project Documents</span>
                                    <Button size="sm" variant="outline" className="border-slate-700 text-cyan-400 hover:bg-slate-800">
                                        Upload New
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {project.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{doc.title}</p>
                                                <p className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {project.documents.length === 0 && (
                                    <p className="text-slate-500 text-sm text-center py-4">No documents uploaded.</p>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column: Team Members */}
                    <div className="space-y-6">
                        <Card className="bg-slate-900 border-slate-800 text-slate-100">
                            <CardHeader>
                                <CardTitle className="text-lg">Team Members</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-slate-700">
                                            <AvatarFallback className="bg-slate-800 text-cyan-400 text-xs">
                                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {member.name}
                                                {member.isLeader && <span className="ml-2 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Leader</span>}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/20 text-slate-100">
                            <CardContent className="p-6">
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
