"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2 } from "lucide-react"

export function ProjectTypeTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        fetchTypes()
    }, [])

    const fetchTypes = async () => {
        const res = await fetch('/api/project-types')
        if (res.ok) setData(await res.json())
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this project type?")) return;
        await fetch(`/api/project-types?id=${id}`, { method: 'DELETE' })
        fetchTypes()
    }

    // Add/Edit logic
    const handleEdit = (item: any) => {
        setFormData(item)
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const url = formData.id ? '/api/project-types' : '/api/project-types'
        const method = formData.id ? 'PUT' : 'POST'

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        setShowModal(false)
        fetchTypes()
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h3 className="text-lg font-medium text-white">Project Types</h3>
                <Button className="bg-blue-600" onClick={() => { setFormData({}); setShowModal(true); }}>Add Type</Button>
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
                        {data.map((item) => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal Implementation (Inline or Import) */}
            {/* Using the imported Modal would require importing it at the top */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-white mb-4">{formData.id ? 'Edit' : 'Add'} Project Type</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="Type Name (e.g. Major Project)"
                                className="bg-slate-800 border-slate-700"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                                placeholder="Description"
                                className="bg-slate-800 border-slate-700"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-600">{formData.id ? 'Update' : 'Save'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
