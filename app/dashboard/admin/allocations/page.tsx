"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Users, Briefcase, GraduationCap, AlertCircle } from "lucide-react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export default function AllocationsPage() {
    const [projects, setProjects] = useState<any[]>([])
    const [facultyList, setFacultyList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [selectedFaculty, setSelectedFaculty] = useState<string>("")
    const [isModalOpen, setIsModalOpen] = useState(false)

    async function fetchData() {
        setLoading(true)
        try {
            const res = await fetch('/api/allocations?status=all&maxLoad=5') // Fetch all to allow unassigning
            if (res.ok) {
                const data = await res.json()
                setProjects(data.projects || []) // Note: API returns 'projects' now, not 'unassignedProjects'
                setFacultyList(data.faculty || [])
            }
        } catch (error) {
            console.error("Failed to fetch allocations", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.leader.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenAssignModal = (project: any) => {
        setSelectedProject(project)
        setSelectedFaculty("")
        setIsModalOpen(true)
    }

    const handleConfirmAssignment = async () => {
        if (!selectedFaculty || !selectedProject) return

        try {
            const res = await fetch('/api/allocations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: selectedProject.id, guideId: selectedFaculty })
            })

            if (res.ok) {
                await fetchData()
                setIsModalOpen(false)
                setSelectedProject(null)
            } else {
                alert("Failed to assign guide")
            }
        } catch (error) {
            console.error("Assignment error", error)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="Allocations" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent animate-slide-down selection:text-white selection:bg-cyan-500/20">
                            Project Allocations
                        </h1>
                        <p className="text-muted-foreground mt-2">Assign faculty guides to pending student projects</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="glass-modern border-cyan-500/20 px-4 py-2">
                            <AlertCircle className="h-3 w-3 mr-2" />
                            {projects.filter(p => !p.guideId).length} Pending
                        </Badge>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="glass-modern border-cyan-500/20 hover-float overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Unassigned</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br bg-gradient-primary shadow-lg shadow-cyan-500/30">
                                <Briefcase className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-cyan-400">
                                {projects.filter(p => !p.guideId).length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Projects awaiting guides</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-emerald-500/20 hover-float overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Available Faculty</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/30">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-emerald-400">
                                {facultyList.filter(f => f.load < f.maxLoad).length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Ready to mentor</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-blue-500/20 hover-float overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Students</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-blue-400">
                                {projects.length * 4}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting allocation</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card className="glass-modern border-cyan-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-xl">Manage Allocations</CardTitle>
                            <CardDescription>View all projects and assign or change faculty guides</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects or students..."
                                className="pl-10 glass-modern border-cyan-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-4 glass-modern border-cyan-500/20 rounded-xl">
                                        <div className="h-4 w-3/4 skeleton mb-2" />
                                        <div className="h-3 w-1/2 skeleton" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
                                    <Briefcase className="h-8 w-8 text-cyan-400" />
                                </div>
                                <p className="text-muted-foreground">No projects found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-5 glass-modern border-cyan-500/20 rounded-xl hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-lg group-hover:text-cyan-400 transition-colors truncate">
                                                        {project.title}
                                                    </h3>
                                                    {project.guideId ? (
                                                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                                                            Assigned
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-amber-500/20 text-amber-400 bg-amber-500/5">
                                                            Unassigned
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5" />
                                                        <span>{project.leader}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant="outline" className="border-cyan-500/20 text-cyan-400">
                                                            {project.batch}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                                                            {project.dept}
                                                        </Badge>
                                                    </div>
                                                    {project.guideName && project.guideName !== "Unassigned" && (
                                                        <div className="flex items-center gap-1.5 text-emerald-400/80">
                                                            <GraduationCap className="h-3.5 w-3.5" />
                                                            <span>Guide: {project.guideName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={project.guideId ? "outline" : "default"}
                                                className={project.guideId
                                                    ? "border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400"
                                                    : "bg-gradient-to-r bg-gradient-primary hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
                                                }
                                                onClick={() => handleOpenAssignModal(project)}
                                            >
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                {project.guideId ? "Change Guide" : "Assign Guide"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Assignment Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="glass-modern border-cyan-500/20 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-cyan-400">
                            Assign Faculty Guide
                        </DialogTitle>
                        <DialogDescription>
                            Project: <span className="font-semibold text-foreground">{selectedProject?.title}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        <div>
                            <label className="text-sm font-medium mb-3 block">Select Faculty Member</label>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {facultyList.map((faculty) => {
                                    const percentage = (faculty.load / faculty.maxLoad) * 100
                                    const isOverloaded = faculty.load >= faculty.maxLoad
                                    const isSelected = selectedFaculty === faculty.id

                                    return (
                                        <button
                                            key={faculty.id}
                                            onClick={() => !isOverloaded && setSelectedFaculty(faculty.id)}
                                            disabled={isOverloaded}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                ? 'border-violet-500 bg-cyan-500/10'
                                                : isOverloaded
                                                    ? 'border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed'
                                                    : 'border-cyan-500/20 hover:border-violet-500/40 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-12 w-12 border-2 border-violet-500/30">
                                                    <AvatarFallback className="bg-gradient-to-br bg-gradient-primary text-white font-semibold">
                                                        {faculty.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold">{faculty.name}</h4>
                                                        <span className={`text-xs font-semibold ${isOverloaded ? 'text-red-400' : 'text-emerald-400'
                                                            }`}>
                                                            {faculty.load}/{faculty.maxLoad}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={percentage}
                                                        className={`h-2 ${isOverloaded
                                                            ? '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-orange-500'
                                                            : '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500'
                                                            }`}
                                                    />
                                                    {isOverloaded && (
                                                        <p className="text-xs text-red-400 mt-2">At maximum capacity</p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 glass-modern border-cyan-500/20"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmAssignment}
                                className="flex-1 bg-gradient-to-r bg-gradient-primary hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-cyan-500/30"
                                disabled={!selectedFaculty}
                            >
                                Confirm Assignment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
