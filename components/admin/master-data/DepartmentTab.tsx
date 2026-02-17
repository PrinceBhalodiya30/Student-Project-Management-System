"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit2, Trash2, AlertCircle, Check } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { toast } from "sonner"

export function DepartmentTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments')
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to load departments")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormData({})
        setIsEditing(false)
        setShowModal(true)
    }

    const handleEdit = (item: any) => {
        setFormData(item)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this department?")) return;

        try {
            const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDepartments();
                toast.success("Department deleted successfully")
            } else {
                const json = await res.json();
                toast.error(json.error || "Failed to delete department")
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete department")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = isEditing ? `/api/departments/${formData.id}` : '/api/departments'
        const method = isEditing ? 'PUT' : 'POST'

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const json = await res.json()

            if (res.ok) {
                fetchDepartments()
                setShowModal(false)
                toast.success(isEditing ? "Department updated successfully" : "Department created successfully")
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
                <Input placeholder="Search departments..." className="max-w-xs bg-slate-900 border-slate-700" />
                <Button onClick={handleAdd} className="bg-blue-600 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Department
                </Button>
            </div>

            <div className="bg-slate-900 rounded border border-slate-800 p-4">
                {loading ? (
                    <div className="text-slate-400">Loading departments...</div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Code / Slug</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No departments found.</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{item.slug || item.code}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-400" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? "Edit Department" : "Add Department"}>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="text-sm font-medium text-slate-300">Department Name</label>
                        <Input
                            required
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Computer Science & Engineering"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300">Code / Slug</label>
                        <Input
                            required
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.code || ''}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g. CSE"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600">{isEditing ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
