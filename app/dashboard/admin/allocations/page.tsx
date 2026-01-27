"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus } from "lucide-react"

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
            const res = await fetch('/api/allocations')
            if (res.ok) {
                const data = await res.json()
                setProjects(data.unassignedProjects || [])
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

    // Filter projects
    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.leader.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenAssignModal = (project: any) => {
        setSelectedProject(project)
        setSelectedFaculty("") // Reset selection
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
                // Refresh data
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
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Project Allocations</h1>
                    <p className="text-slate-400">Assign guides to pending student projects.</p>
                </div>
            </div>

            <Card className="bg-[#1e293b] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
                    <CardTitle className="text-xl font-semibold text-white">
                        Unassigned Projects {loading && <span className="text-sm font-normal text-slate-500 ml-2">(Loading...)</span>}
                    </CardTitle>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search projects or students..."
                            className="pl-10 bg-slate-900 border-slate-700 text-slate-300 placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b [&_tr]:border-slate-800">
                                <tr className="border-b border-slate-800 transition-colors hover:bg-slate-800/50 data-[state=selected]:bg-slate-800">
                                    <th className="h-12 px-4 align-middle font-medium text-slate-400">Project Title</th>
                                    <th className="h-12 px-4 align-middle font-medium text-slate-400">Student Leader</th>
                                    <th className="h-12 px-4 align-middle font-medium text-slate-400">Batch</th>
                                    <th className="h-12 px-4 align-middle font-medium text-slate-400">Department</th>
                                    <th className="h-12 px-4 align-middle font-medium text-slate-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {!loading && filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            No unassigned projects found.
                                        </td>
                                    </tr>
                                )}
                                {filteredProjects.map((project) => (
                                    <tr key={project.id} className="border-b border-slate-800 transition-colors hover:bg-slate-800/50">
                                        <td className="p-4 align-middle font-medium text-white">{project.title}</td>
                                        <td className="p-4 align-middle text-slate-300">{project.leader}</td>
                                        <td className="p-4 align-middle text-slate-300">{project.batch}</td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-900">
                                                {project.dept}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-500 text-white"
                                                onClick={() => handleOpenAssignModal(project)}
                                            >
                                                Assign Guide
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Assign Guide to "${selectedProject?.title}"`}
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
                            onClick={() => setIsModalOpen(false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAssignment}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                            disabled={!selectedFaculty}
                        >
                            Confirm Assignment
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
