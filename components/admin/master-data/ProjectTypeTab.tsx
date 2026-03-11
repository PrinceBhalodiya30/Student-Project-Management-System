"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, AlertCircle, Check, Plus } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { toast } from "sonner"

export function ProjectTypeTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})

    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    useEffect(() => setCurrentPage(1), [searchTerm])

    useEffect(() => {
        fetchTypes()
    }, [])

    const fetchTypes = async () => {
        try {
            const res = await fetch('/api/project-types')
            if (res.ok) setData(await res.json())
        } catch (error) {
            console.error(error)
            toast.error("Failed to load project types")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this project type?")) return;
        try {
            const res = await fetch(`/api/project-types?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchTypes()
                toast.success("Project type deleted successfully")
            } else {
                const json = await res.json()
                toast.error(json.error || "Failed to delete project type")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete project type")
        }
    }

    // Add/Edit logic
    const handleEdit = (item: any) => {
        setFormData(item)
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = '/api/project-types'
        const method = formData.id ? 'PUT' : 'POST'

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const json = await res.json()

            if (res.ok) {
                setShowModal(false)
                fetchTypes()
                toast.success(formData.id ? "Project type updated" : "Project type created")
            } else {
                toast.error(json.error || "Operation failed")
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
        }
    }

    return (
        <div className="space-y-4">


            <div className="flex justify-between">
                <Input 
                    placeholder="Search types..." 
                    className="max-w-xs bg-slate-900 border-slate-700" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button className="bg-blue-600 gap-2" onClick={() => { setFormData({}); setShowModal(true); }}>
                    <Plus className="h-4 w-4" />
                    Add Type
                </Button>
            </div>

            <div className="bg-slate-900 rounded border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No project types found.</td>
                            </tr>
                        ) : (
                            paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                                    <td className="px-4 py-3">{item.description || "-"}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredData.length > 0 && (
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-xs text-slate-500">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                            onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                            onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={formData.id ? 'Edit Project Type' : 'Add Project Type'}>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="text-sm font-medium text-slate-300">Type Name</label>
                        <Input
                            placeholder="e.g. Major Project"
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <Input
                            placeholder="Brief description"
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600">{formData.id ? 'Update' : 'Save'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
