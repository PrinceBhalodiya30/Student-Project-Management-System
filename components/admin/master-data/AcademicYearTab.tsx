"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2, Check, Calendar as CalendarIcon } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"

export function AcademicYearTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        fetchYears()
    }, [])

    const fetchYears = async () => {
        try {
            const res = await fetch('/api/academic-years')
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormData({ isCurrent: false })
        setIsEditing(false)
        setShowModal(true)
    }

    const handleEdit = (item: any) => {
        // Format dates for input type="date"
        const formatForInput = (dateStr: string) => {
            if (!dateStr) return '';
            return new Date(dateStr).toISOString().split('T')[0];
        }

        setFormData({
            ...item,
            startDate: formatForInput(item.startDate),
            endDate: formatForInput(item.endDate)
        })
        setIsEditing(true)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this academic year?")) return;

        try {
            const res = await fetch(`/api/academic-years/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchYears();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = isEditing ? `/api/academic-years/${formData.id}` : '/api/academic-years'
        const method = isEditing ? 'PUT' : 'POST'

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                fetchYears()
                setShowModal(false)
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <div className="text-sm text-slate-400 pt-2">Manage academic calendars and timelines.</div>
                <Button onClick={handleAdd} className="bg-blue-600 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Academic Year
                </Button>
            </div>

            <div className="bg-slate-900 rounded border border-slate-800 p-4">
                {loading ? (
                    <div className="text-slate-400">Loading years...</div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No academic years found.</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 text-white font-medium">
                                            {item.name}
                                            <div className="text-xs text-slate-500 font-mono">{item.slug}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-3 w-3 text-slate-500" />
                                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.isCurrent ? (
                                                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Current Year</Badge>
                                            ) : (
                                                <span className="text-xs text-slate-600">Past/Future</span>
                                            )}
                                        </td>
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? "Edit Academic Year" : "Add Academic Year"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-300">Year Name</label>
                        <Input
                            required
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. 2024-2025"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300">Slug</label>
                        <Input
                            required
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.slug || ''}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="e.g. AY-24-25"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300">Start Date</label>
                            <Input
                                required
                                type="date"
                                className="bg-slate-800 border-slate-700 mt-1"
                                value={formData.startDate || ''}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300">End Date</label>
                            <Input
                                required
                                type="date"
                                className="bg-slate-800 border-slate-700 mt-1"
                                value={formData.endDate || ''}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="isCurrent"
                            className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-600"
                            checked={formData.isCurrent || false}
                            onChange={e => setFormData({ ...formData, isCurrent: e.target.checked })}
                        />
                        <label htmlFor="isCurrent" className="text-sm text-slate-300">Set as Current Academic Year</label>
                    </div>
                    <div className="text-xs text-slate-500">
                        Setting this as current will automatically unset any other active academic year.
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
