"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, UserPlus } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StudentTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [isEditing, setIsEditing] = useState(false)

    const [departments, setDepartments] = useState<any[]>([])

    useEffect(() => {
        fetchStudents()
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments')
            if (res.ok) {
                const json = await res.json()
                setDepartments(json)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const fetchStudents = async () => {
        const res = await fetch('/api/students')
        if (res.ok) setData(await res.json())
        setLoading(false)
    }

    const handleEdit = (item: any) => {
        setFormData({
            ...item,
            id: item.userId // Important: Use User ID for updates
        })
        setIsEditing(true)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            // Delete using User ID (which is item.userId from GET)
            const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
            if (res.ok) fetchStudents();
        } catch (error) {
            console.error(error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = isEditing ? `/api/students/${formData.id}` : '/api/students'
        const method = isEditing ? 'PUT' : 'POST'

        try {
            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            fetchStudents()
            setShowModal(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Input placeholder="Search students..." className="max-w-xs bg-slate-900 border-slate-700" />
                <Button className="bg-blue-600" onClick={() => { setFormData({}); setIsEditing(false); setShowModal(true); }}><UserPlus className="mr-2 h-4 w-4" /> Add Student</Button>
            </div>
            <div className="bg-slate-900 rounded border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">ID Number</th>
                            <th className="px-4 py-3">Department</th>
                            <th className="px-4 py-3">Batch</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30">
                                <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                                <td className="px-4 py-3 font-mono text-xs">{item.idNumber}</td>
                                <td className="px-4 py-3">{item.department}</td>
                                <td className="px-4 py-3">{item.batch}</td>
                                <td className="px-4 py-3 text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => handleDelete(item.userId)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? "Edit Student" : "Add Student"}>
                <div className="bg-slate-900 border border-slate-700 rounded-lg w-full p-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input placeholder="Full Name" className="bg-slate-800 border-slate-700"
                            value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <Input placeholder="Email" type="email" className="bg-slate-800 border-slate-700"
                            value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="ID Number" className="bg-slate-800 border-slate-700"
                                value={formData.idNumber || ''} onChange={e => setFormData({ ...formData, idNumber: e.target.value })} required />
                            <Input placeholder="Batch (e.g. 2024)" className="bg-slate-800 border-slate-700"
                                value={formData.batch || ''} onChange={e => setFormData({ ...formData, batch: e.target.value })} required />
                        </div>

                        <Select
                            value={formData.department}
                            onValueChange={(val) => setFormData({ ...formData, department: val })}
                        >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={d.code}>{d.name} ({d.code})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600">{isEditing ? "Update Student" : "Add Student"}</Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}
