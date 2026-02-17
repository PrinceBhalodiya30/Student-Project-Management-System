"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Search, Plus, Filter, Eye, Folder, CheckCircle2, Users,
    MoreHorizontal, Trash2, X, Briefcase, Clock, GraduationCap, Edit2
} from "lucide-react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function ProjectsDirectoryPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, completed: 0, proposed: 0, activeStudents: 0 });
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "MAJOR",
        groupName: "",
        department: "CS",
        members: [] as string[]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [filterDept, setFilterDept] = useState("ALL");
    const router = useRouter();

    const [projectTypes, setProjectTypes] = useState<any[]>([]);

    useEffect(() => {
        fetchProjects();
        fetch('/api/students').then(r => r.json()).then(setStudents);
        fetch('/api/project-types').then(r => r.json()).then(setProjectTypes);
    }, []);

    async function fetchProjects() {
        setLoading(true);
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);

                let studentCount = 0;
                data.forEach((p: any) => {
                    if (p.ProjectGroup?.StudentProfile) {
                        studentCount += p.ProjectGroup.StudentProfile.length;
                    }
                });

                setStats({
                    total: data.length,
                    completed: data.filter((p: any) => p.status === 'COMPLETED').length,
                    proposed: data.filter((p: any) => p.status === 'PROPOSED').length,
                    activeStudents: studentCount
                });
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const url = isEditing && currentProjectId ? `/api/projects/${currentProjectId}` : '/api/projects';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsCreateOpen(false);
                resetForm();
                fetchProjects();
                toast.success(isEditing ? "Project updated successfully" : "Project created successfully");
            } else {
                toast.error(isEditing ? "Failed to update project." : "Failed to create project.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        }
    }

    const resetForm = () => {
        // Default to first type if available, otherwise empty string (or keep MAJOR as fallback if types not loaded yet)
        const defaultType = projectTypes.length > 0 ? projectTypes[0].name : "MAJOR";
        setFormData({ title: "", description: "", type: defaultType, groupName: "", department: "CS", members: [] });
        setIsEditing(false);
        setCurrentProjectId(null);
    }

    const handleCreate = () => {
        resetForm();
        setIsCreateOpen(true);
    }

    const handleEdit = (project: any) => {
        const memberIds = project.ProjectGroup?.StudentProfile?.map((s: any) => s.id) || [];
        setFormData({
            title: project.title,
            description: project.description || "",
            // Fix: Access Type.name, fallback to 'MAJOR'
            type: project.Type?.name || "MAJOR",
            groupName: project.ProjectGroup?.name || "",
            // Use the department of the first student, or default to CS if none
            department: project.ProjectGroup?.StudentProfile?.[0]?.department || "CS",
            members: memberIds
        });
        setCurrentProjectId(project.id);
        setIsEditing(true);
        setIsCreateOpen(true);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProjects();
                toast.success("Project deleted successfully");
            } else {
                toast.error("Failed to delete project");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        }
    }

    const toggleMember = (id: string) => {
        const current = formData.members || []
        if (current.includes(id)) {
            setFormData({ ...formData, members: current.filter((m: string) => m !== id) })
        } else {
            setFormData({ ...formData, members: [...current, id] })
        }
    }

    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.ProjectGroup?.StudentProfile?.[0]?.User?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase());

        // Check against Type.name for filtering
        const typeName = project.Type?.name || project.type || "";
        const matchesType = filterType === "ALL" || typeName === filterType;
        const matchesDept = filterDept === "ALL" || (project.ProjectGroup?.StudentProfile?.[0]?.department || "CS") === filterDept;

        return matchesSearch && matchesType && matchesDept;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'PROPOSED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    }

    return (
        <div suppressHydrationWarning className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="Projects" />
            </div>

            <main suppressHydrationWarning className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="animate-slide-down">
                        <h1 className="text-4xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent animate-slide-down selection:text-white selection:bg-cyan-500/20">
                            All Projects
                        </h1>
                        <p className="text-muted-foreground mt-2">Manage and monitor academic projects across all departments</p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-cyan-500/30 hover-scale active-press animate-slide-left"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add New Project
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-modern border-cyan-500/20 hover-float stagger-item overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Projects</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-primary shadow-lg shadow-cyan-500/30 hover-scale">
                                <Folder className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-cyan-400">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-emerald-500/20 hover-float stagger-item overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Completed</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-success shadow-lg shadow-emerald-500/30 hover-scale">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-emerald-400">
                                {stats.completed}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-amber-500/20 hover-float stagger-item overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">In Approval</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-warning shadow-lg shadow-amber-500/30 hover-scale">
                                <Clock className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-amber-400">
                                {stats.proposed}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-blue-500/20 hover-float overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Students</CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-primary shadow-lg shadow-blue-500/30 hover-scale">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-blue-400">
                                {stats.activeStudents}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="glass-card border-violet-500/20">
                    <CardContent className="p-4 flex gap-4 flex-wrap">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-10 glass-card border-violet-500/20"
                                placeholder="Search by Project ID, Title, or Team Leader..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[180px] glass-card border-violet-500/20">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10">
                                <SelectItem value="ALL">All Types</SelectItem>
                                {projectTypes.map(t => (
                                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                                ))}
                                {/* Fallbacks if no types yet */}
                                {projectTypes.length === 0 && (
                                    <>
                                        <SelectItem value="MAJOR">Major Project</SelectItem>
                                        <SelectItem value="MINI">Mini Project</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>

                        <Select value={filterDept} onValueChange={setFilterDept}>
                            <SelectTrigger className="w-[200px] glass-card border-violet-500/20">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10">
                                <SelectItem value="ALL">All Departments</SelectItem>
                                <SelectItem value="CS">Computer Science</SelectItem>
                                <SelectItem value="SE">Software Engineering</SelectItem>
                                <SelectItem value="IT">Information Tech</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <div className="h-4 w-3/4 skeleton" />
                                    <div className="h-3 w-1/2 skeleton mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-16 skeleton" />
                                </CardContent>
                            </Card>
                        ))
                    ) : filteredProjects.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No projects found
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <Card key={project.id} className="glass-modern border-cyan-500/20 hover-float group">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg group-hover:text-cyan-400 transition-colors">
                                                {project.title}
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-1">
                                                {project.id}
                                            </CardDescription>
                                        </div>
                                        <Badge className={`${getStatusColor(project.status)} border`}>
                                            {project.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {project.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">
                                            {project.Type?.name || project.type || 'N/A'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users className="h-3 w-3" />
                                        <span>{project.ProjectGroup?.StudentProfile?.[0]?.User?.fullName || "No Leader"}</span>
                                    </div>

                                    {project.FacultyProfile && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <GraduationCap className="h-3 w-3" />
                                            <span>{project.FacultyProfile.User.fullName}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 glass-modern border-cyan-500/20 hover:bg-cyan-500/10"
                                            onClick={() => router.push(`/dashboard/admin/projects/${project.id}`)}
                                        >
                                            <Eye className="h-3 w-3 mr-1" /> View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="glass-modern border-blue-500/20 hover:bg-blue-500/10 text-blue-400"
                                            onClick={() => handleEdit(project)}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="glass-modern border-red-500/20 hover:bg-red-500/10 text-red-400"
                                            onClick={() => handleDelete(project.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>

            {/* Create/Edit Project Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="glass-modern border-cyan-500/20 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-cyan-400">
                            {isEditing ? "Edit Project" : "Create New Project"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Update existing project details" : "Add a new academic project to the system"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Project Title</Label>
                            <Input
                                className="glass-modern border-cyan-500/20 mt-1"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                className="glass-modern border-cyan-500/20 mt-1"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Project Type</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger className="glass-modern border-cyan-500/20 mt-1">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-modern border-cyan-500/20">
                                        {projectTypes.length > 0 ? (
                                            projectTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.name}>
                                                    {type.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <>
                                                <SelectItem value="MAJOR">Major Project</SelectItem>
                                                <SelectItem value="MINI">Mini Project</SelectItem>
                                                <SelectItem value="RESEARCH">Research</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Group Name</Label>
                                <Input
                                    className="glass-modern border-cyan-500/20 mt-1"
                                    value={formData.groupName}
                                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Select Team Members</Label>
                            <div className="mt-2 max-h-48 overflow-y-auto space-y-2 glass-modern border-cyan-500/20 p-3 rounded-lg">
                                {students.map((student) => (
                                    <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-cyan-500/10 p-2 rounded transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.members.includes(student.id)}
                                            onChange={() => toggleMember(student.id)}
                                            className="rounded border-cyan-500/20"
                                        />
                                        <span className="text-sm">{student.name} - {student.department}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="flex-1 glass-modern border-cyan-500/20"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-primary hover:opacity-90 shadow-lg shadow-cyan-500/30"
                            >
                                {isEditing ? "Update Project" : "Create Project"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
