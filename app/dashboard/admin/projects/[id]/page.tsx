"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Modal } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Users, User, FileText, CheckCircle2, XCircle, Clock, UserPlus, Edit2, Search } from "lucide-react"

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()

    // Unwrap params using React.use()
    const { id } = use(params)

    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    // Allocation State
    const [facultyList, setFacultyList] = useState<any[]>([])
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [selectedFaculty, setSelectedFaculty] = useState<string>("")

    useEffect(() => {
        fetchProjectDetails()
        fetchFaculty()
    }, [id])

    async function fetchFaculty() {
        try {
            const res = await fetch('/api/allocations')
            if (res.ok) {
                const data = await res.json()
                setFacultyList(data.faculty || [])
            }
        } catch (error) {
            console.error("Failed to fetch faculty", error)
        }
    }

    async function fetchProjectDetails() {
        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${id}`)
            if (res.ok) {
                const data = await res.json()
                setProject(data)
            } else {
                console.error("Failed to fetch")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(newStatus: string) {
        if (!confirm(`Are you sure you want to mark this project as ${newStatus}?`)) return

        setActionLoading(true)
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                fetchProjectDetails() // Refresh UI
            } else {
                alert("Failed to update status")
            }
        } catch (error) {
            console.error(error)
            alert("Error updating status")
        } finally {
            setActionLoading(false)
        }
    }

    async function handleAssignGuide() {
        if (!selectedFaculty) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guideId: selectedFaculty, status: 'IN_PROGRESS' }) // Auto-set status to IN_PROGRESS on assignment? Optional but good UX.
            })

            if (res.ok) {
                fetchProjectDetails()
                fetchFaculty() // Refresh loads
                setIsAssignModalOpen(false)
                setSelectedFaculty("")
            } else {
                alert("Failed to assign guide")
            }
        } catch (error) {
            console.error(error)
            alert("Error assigning guide")
        } finally {
            setActionLoading(false)
        }
    }

    // Edit Team State
    const [allStudents, setAllStudents] = useState<any[]>([])
    const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])

    async function fetchStudents() {
        const res = await fetch('/api/students')
        if (res.ok) {
            const data = await res.json()
            setAllStudents(data)
        }
    }

    function openEditTeam() {
        fetchStudents()
        // Pre-select current members
        const currentIds = project.ProjectGroup?.StudentProfile?.map((s: any) => s.id) || []
        setSelectedMembers(currentIds)
        setIsEditTeamOpen(true)
    }

    async function handleUpdateTeam() {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ members: selectedMembers })
            })
            if (res.ok) {
                fetchProjectDetails()
                setIsEditTeamOpen(false)
            } else {
                alert("Failed to update team")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    const toggleTeamMember = (studentId: string) => {
        if (selectedMembers.includes(studentId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== studentId))
        } else {
            setSelectedMembers([...selectedMembers, studentId])
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading project details...</div>
    }

    if (!project) {
        return <div className="p-8 text-center text-slate-400">Project not found.</div>
    }

    const { title, description, status, ProjectGroup, FacultyProfile, createdAt, updatedAt } = project
    const studentMembers = ProjectGroup?.StudentProfile || []

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 p-6 font-sans overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    className="text-slate-400 hover:text-white mb-4 pl-0"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
                </Button>

                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{title}</h1>
                            <StatusBadge status={status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Created: {new Date(createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Updated: {new Date(updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Action Buttons for PROPOSED projects */}
                    {status === 'PROPOSED' && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                onClick={() => updateStatus('REJECTED')}
                                disabled={actionLoading}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-500 text-white"
                                onClick={() => updateStatus('APPROVED')}
                                disabled={actionLoading}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Proposal
                            </Button>
                        </div>
                    )}

                    {/* Action Buttons for Active Projects */}
                    {(status === 'IN_PROGRESS' || status === 'APPROVED') && (
                        <div className="flex gap-3">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                onClick={() => updateStatus('COMPLETED')}
                                disabled={actionLoading}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Synopsis & Milestones */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-[#1e293b] border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" /> Synopsis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {description || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#1e293b] border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-amber-500" /> Documents
                            </CardTitle>
                            <CardDescription className="text-slate-400">Project files and submissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {project.Document && project.Document.length > 0 ? (
                                <ul className="space-y-2">
                                    {project.Document.map((doc: any) => (
                                        <li key={doc.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-md border border-slate-800">
                                            <span className="text-sm font-medium text-slate-300">{doc.name}</span>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline">View</a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No documents uploaded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Team & Guide */}
                <div className="space-y-6">
                    <Card className="bg-[#1e293b] border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-500" /> Team Details
                                </div>
                                <Button size="sm" variant="ghost" onClick={openEditTeam} className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Group Name</label>
                                <p className="text-white font-medium">{ProjectGroup?.name || "No Group Name"}</p>
                            </div>
                            <Separator className="bg-slate-800" />
                            <div>
                                <label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Members</label>
                                <ul className="space-y-3">
                                    {studentMembers.map((student: any) => (
                                        <li key={student.id} className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                                {student.User?.fullName?.charAt(0) || "S"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{student.User?.fullName}</p>
                                                <p className="text-xs text-slate-400">{student.idNumber} • {student.email}</p>
                                            </div>
                                        </li>
                                    ))}
                                    {studentMembers.length === 0 && <p className="text-sm text-slate-500">No members found.</p>}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#1e293b] border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                <User className="h-5 w-5 text-green-500" /> Faculty Guide
                            </CardTitle>
                            {!FacultyProfile && (
                                <Button size="sm" variant="ghost" className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" onClick={() => setIsAssignModalOpen(true)}>
                                    <UserPlus className="h-4 w-4 mr-1" /> Assign
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="pt-4">
                            {FacultyProfile ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center text-green-500 font-bold">
                                        {FacultyProfile.User?.fullName?.charAt(0) || "F"}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{FacultyProfile.User?.fullName}</p>
                                        <p className="text-xs text-slate-400">{FacultyProfile.department || "Faculty"}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-white" onClick={() => setIsAssignModalOpen(true)}>
                                        <UserPlus className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center p-4 border border-dashed border-slate-700 rounded-md">
                                    <p className="text-sm text-slate-400">No guide assigned yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Assign Faculty Guide"
                className="max-w-md"
            >
                <div className="flex flex-col gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Select Faculty Guide</label>
                        <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                            <SelectTrigger className="w-full bg-slate-900 border-slate-700 text-slate-300">
                                <SelectValue placeholder="Choose a faculty member..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-300">
                                {facultyList.map((faculty) => (
                                    <SelectItem
                                        key={faculty.id}
                                        value={faculty.id}
                                        disabled={faculty.load >= faculty.maxLoad}
                                        className="focus:bg-slate-800 focus:text-white"
                                    >
                                        <div className="flex justify-between w-full min-w-[200px] items-center">
                                            <span>{faculty.name}</span>
                                            <span className={`text-xs ml-2 ${faculty.load >= faculty.maxLoad ? 'text-red-400' : 'text-slate-500'}`}>
                                                (Load: {faculty.load}/{faculty.maxLoad})
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <Button
                            variant="outline"
                            onClick={() => setIsAssignModalOpen(false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignGuide}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                            disabled={!selectedFaculty || actionLoading}
                        >
                            {actionLoading ? "Assigning..." : "Confirm Assignment"}
                        </Button>
                    </div>
                </div>
            </Modal>
            {/* Edit Team Modal */}
            <Modal
                isOpen={isEditTeamOpen}
                onClose={() => setIsEditTeamOpen(false)}
                title="Edit Project Team"
                className="max-w-xl"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-md pl-9 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-2 border border-slate-800 rounded-md p-2">
                        {allStudents.map(student => {
                            const isAssignedToOther = student.groupId && student.groupId !== project.groupId;
                            const assignedGroup = isAssignedToOther
                                ? allStudents.find(s => s.groupId === student.groupId)?.ProjectGroup // This logic is flawed, we need project info. 
                                // Actually API /api/students should ideally return group info.
                                // But for now, just filtering is confusing. 
                                // Let's just show (Assigned) warning.
                                : null;

                            return (
                                <div key={student.id} className={`flex items-center gap-3 p-2 rounded ${selectedMembers.includes(student.id) ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-slate-800 border border-transparent'}`}>
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-600 bg-slate-800"
                                        checked={selectedMembers.includes(student.id)}
                                        onChange={() => toggleTeamMember(student.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-slate-200">{student.name}</div>
                                        <div className="text-xs text-slate-500">{student.idNumber}</div>
                                    </div>
                                    {isAssignedToOther && <span className="text-xs text-amber-500 italic">Already in a group</span>}
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setIsEditTeamOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateTeam} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-500 text-white">
                            {actionLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </Modal>

        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    let classes = "bg-slate-800 text-slate-400"
    if (status === 'APPROVED' || status === 'COMPLETED') classes = "bg-green-500/10 text-green-500 border-green-500/20"
    if (status === 'PROPOSED') classes = "bg-amber-500/10 text-amber-500 border-amber-500/20"
    if (status === 'REJECTED') classes = "bg-red-500/10 text-red-500 border-red-500/20"
    if (status === 'IN_PROGRESS') classes = "bg-blue-500/10 text-blue-500 border-blue-500/20"

    return (
        <Badge variant="outline" className={`${classes} border`}>
            {status}
        </Badge>
    )
}
