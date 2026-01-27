"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"

export function StaffTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/staff')
            if (res.ok) setData(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (item: any) => {
        setFormData({
            ...item,
            role: item.role === 'ADMIN' ? 'ADMIN' : 'FACULTY', // Normalize
            // Ensure ID is passed for update (using userId from GET response)
            id: item.userId
        })
        setIsEditing(true)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this staff member?")) return;
        try {
            const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
            if (res.ok) fetchStaff();
        } catch (error) {
            console.error(error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = isEditing ? `/api/staff/${formData.id}` : '/api/staff'
        const method = isEditing ? 'PUT' : 'POST'

        try {
            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            fetchStaff()
            setShowModal(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Input placeholder="Search staff..." className="max-w-xs bg-slate-900 border-slate-700" />
                <Button onClick={() => { setFormData({}); setIsEditing(false); setShowModal(true); }} className="bg-blue-600">Add Staff</Button>
            </div>

            <div className="bg-slate-900 rounded border border-slate-800 p-4">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Dept</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30">
                                <td className="px-4 py-3 text-white">{item.name}</td>
                                <td className="px-4 py-3">{item.email}</td>
                                <td className="px-4 py-3">{item.department}</td>
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? "Edit Staff" : "Add Staff"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-300">Full Name</label>
                        <Input
                            required
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <Input
                            required
                            type="email"
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300">Department</label>
                            <Input
                                className="bg-slate-800 border-slate-700 mt-1"
                                placeholder="e.g. CSE"
                                value={formData.department || ''}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300">Role</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-md h-10 px-3 text-sm mt-1 text-white"
                                value={formData.role || 'FACULTY'}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="FACULTY">Faculty</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600">{isEditing ? "Update Staff" : "Save Staff"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
