"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Plus, Filter, SlidersHorizontal, Eye, Folder, CheckCircle2, Users, MoreHorizontal, ChevronDown, Trash2, X } from "lucide-react"

import { useRouter } from "next/navigation"

export default function ProjectsDirectoryPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, completed: 0, proposed: 0, activeStudents: 0 });
    // Hardcoded group ID from seed for testing
    const [newProject, setNewProject] = useState({ title: "", description: "", type: "MAJOR", groupName: "", department: "CS", members: [] });

    const [students, setStudents] = useState<any[]>([])

    useEffect(() => {
        fetchProjects();
        fetch('/api/students').then(r => r.json()).then(setStudents);
    }, []);

    async function fetchProjects() {
        setLoading(true);
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);

                // Calculate Stats
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
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });
            if (res.ok) {
                setIsCreateOpen(false);
                setNewProject({ title: "", description: "", type: "MAJOR", groupName: "", department: "CS", members: [] });
                fetchProjects(); // Refresh list
            } else {
                alert("Failed to create project. Ensure Group ID exists.");
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProjects();
            } else {
                alert("Failed to delete");
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Helper for multi-select
    const toggleMember = (id: string) => {
        const current = (newProject as any).members || []
        if (current.includes(id)) {
            setNewProject({ ...newProject, members: current.filter((m: string) => m !== id) } as any)
        } else {
            setNewProject({ ...newProject, members: [...current, id] } as any)
        }
    }



    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 p-6 font-sans relative">
            {/* ... header ... */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white">All Projects Directory</h1>
                    <p className="text-slate-400 mt-1">Manage and monitor academic projects across all departments for the current semester.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add New Project
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 my-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        className="bg-[#0f172a] border-slate-700 pl-10 text-slate-300"
                        placeholder="Search by Project ID, Title, or Team Leader..."
                    />
                </div>
                <FilterDropdown label="Year: 2023-24" />
                <FilterDropdown label="Type: Research" />
                <FilterDropdown label="Department: CS" />
                <Button variant="outline" className="bg-[#0f172a] border-slate-700 text-blue-400 hover:text-blue-300">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> More Filters
                </Button>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatBox icon={<Folder className="text-blue-500" />} label="Total Projects" value={stats.total.toString()} />
                <StatBox icon={<CheckCircle2 className="text-green-500" />} label="Completed" value={stats.completed.toString()} />
                <StatBox icon={<MoreHorizontal className="text-amber-500" />} label="In Approval" value={stats.proposed.toString()} />
                <StatBox icon={<Users className="text-indigo-500" />} label="Active Students" value={stats.activeStudents.toString()} />
            </div>

            {/* Table */}
            <div className="bg-[#1e293b] rounded-lg border border-slate-800 overflow-hidden flex-1 flex flex-col">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-[#1e293b] border-b border-slate-700">
                    <div className="col-span-2">Project ID</div>
                    <div className="col-span-3">Project Title</div>
                    <div className="col-span-2">Team Leader</div>
                    <div className="col-span-2">Faculty Guide</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Progress</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No projects found.</div>
                    ) : (
                        projects.map((project) => (
                            <ProjectRow
                                key={project.id}
                                id={project.id}
                                title={project.title}
                                subtitle={`${project.type || "General"} • ${project.status}`}
                                leader={project.ProjectGroup?.StudentProfile?.[0]?.User?.fullName || "--"}
                                guide={project.FacultyProfile?.User?.fullName || "Unassigned"}
                                status={project.status}
                                progress={project.progress || 0}
                                progressColor={project.status === 'COMPLETED' ? "bg-green-500" : "bg-blue-500"}
                                onDelete={() => handleDelete(project.id)}
                                onView={() => router.push(`/dashboard/admin/projects/${project.id}`)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Custom Modal Overlay */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-[#1e293b] border border-slate-700 rounded-lg w-[600px] p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Create New Project</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Project Title</label>
                                <Input required value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className="bg-[#0f172a] border-slate-700 text-white" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Description</label>
                                <Input required value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} className="bg-[#0f172a] border-slate-700 text-white" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Group Name (Team Name)</label>
                                <Input placeholder="e.g. Team Alpha" value={newProject.groupName} onChange={e => setNewProject({ ...newProject, groupName: e.target.value })} className="bg-[#0f172a] border-slate-700 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Type</label>
                                    <select
                                        className="w-full bg-[#0f172a] border border-slate-700 text-slate-300 rounded-md h-10 px-3 text-sm"
                                        value={newProject.type}
                                        onChange={e => setNewProject({ ...newProject, type: e.target.value })}
                                    >
                                        <option value="MAJOR">Major Project</option>
                                        <option value="MINI">Mini Project</option>
                                        <option value="RESEARCH">Research</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Department</label>
                                    <select
                                        className="w-full bg-[#0f172a] border border-slate-700 text-slate-300 rounded-md h-10 px-3 text-sm"
                                        value={newProject.department}
                                        onChange={e => setNewProject({ ...newProject, department: e.target.value })}
                                    >
                                        <option value="CS">Computer Science</option>
                                        <option value="SE">Software Engineering</option>
                                        <option value="IT">Info Tech</option>
                                    </select>
                                </div>
                            </div>

                            {/* Student Selection */}
                            <div className="border border-slate-700 rounded-md p-3">
                                <label className="text-sm text-slate-400 block mb-2">Select Team Members</label>
                                <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                                    {students.map(student => {
                                        const assignedGroup = student.groupId
                                            ? projects.find(p => p.ProjectGroup?.id === student.groupId)?.ProjectGroup
                                            : null;

                                        return (
                                            <div key={student.id} className="flex items-center gap-2 p-1 hover:bg-slate-800 rounded">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-700 bg-slate-900"
                                                    checked={((newProject as any).members || []).includes(student.id)}
                                                    onChange={() => toggleMember(student.id)}
                                                />
                                                <span className="text-sm text-slate-300">{student.name} ({student.idNumber})</span>
                                                {assignedGroup && <span className="text-xs text-amber-500 ml-auto italic">In: {assignedGroup.name}</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Create Project</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function FilterDropdown({ label }: any) {
    return (
        <Button variant="outline" className="bg-[#0f172a] border-slate-700 text-slate-300 w-40 justify-between">
            {label}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
    )
}

function StatBox({ icon, label, value }: any) {
    return (
        <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#0f172a] flex items-center justify-center">
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500">{label}</div>
            </div>
        </div>
    )
}

function ProjectRow({ id, title, subtitle, leader, guide, status, progress, progressColor, onDelete, onView }: any) {
    let badgeClass = "bg-blue-500/10 text-blue-500"
    if (status === 'COMPLETED') badgeClass = "bg-green-500/10 text-green-500"
    if (status === 'PROPOSED') badgeClass = "bg-amber-500/10 text-amber-500"
    if (status === 'On Hold') badgeClass = "bg-slate-500/10 text-slate-500"

    return (
        <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
            <div className="col-span-2 text-xs text-slate-400 font-mono">{id}</div>
            <div className="col-span-3">
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-[10px] text-slate-500">{subtitle}</div>
            </div>
            <div className="col-span-2 text-sm text-slate-300">{leader}</div>
            <div className="col-span-2 text-sm text-slate-300">{guide}</div>
            <div className="col-span-1">
                <Badge variant="secondary" className={`border-none ${badgeClass} text-[10px]`}>{status}</Badge>
            </div>
            <div className="col-span-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${progressColor}`} style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-400">{progress}%</span>
            </div>
            <div className="col-span-1 text-center flex justify-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={onView}>
                    <Eye className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
