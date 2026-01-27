"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Edit2, Trash2 } from "lucide-react"

export function ProjectGroupTab() {
    const [data, setData] = useState<any[]>([])

    const [students, setStudents] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/project-groups').then(r => r.json()).then(setData)
        fetch('/api/students').then(r => r.json()).then(setStudents)
    }, [])

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})

    const handleEdit = (group: any) => {
        // Find students currently in this group
        // The API returns members as a string "Name1, Name2". We need IDs.
        // Wait, the API GET /api/project-groups returns `formatted` object. 
        // We might need to adjust GET to return member IDs or filter from `students` list.
        // Actually, let's use the `students` list. 
        // If the student has groupId === group.id, they are in this group.

        const currentMemberIds = students
            .filter(s => s.groupId === group.id)
            .map(s => s.id)

        setFormData({ name: group.name, id: group.id, members: currentMemberIds })
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will unassign all members from this group.")) return;
        await fetch(`/api/project-groups/${id}`, { method: 'DELETE' });
        fetchData();
    }

    const fetchData = () => {
        fetch('/api/project-groups').then(r => r.json()).then(setData)
        fetch('/api/students').then(r => r.json()).then(setStudents)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const url = formData.id ? `/api/project-groups/${formData.id}` : '/api/project-groups'
        const method = formData.id ? 'PUT' : 'POST'

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        setShowModal(false)
        fetchData()
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Project Groups</h3>
                <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => { setFormData({}); setShowModal(true); }}>New Group</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map(group => (
                    <div key={group.id} className="bg-slate-900 p-4 rounded border border-slate-800 relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => handleEdit(group)}>
                                <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-400" onClick={() => handleDelete(group.id)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="flex justify-between items-start mb-2 pr-12">
                            <h4 className="text-white font-semibold">{group.name}</h4>
                            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">{group.memberCount} Members</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">{group.projectName}</p>
                        <div className="text-xs text-slate-400">
                            <strong>Members:</strong> {group.members || "None"}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-white mb-4">{formData.id ? 'Edit' : 'Create'} Project Group</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input placeholder="Group Name" className="bg-slate-800 border-slate-700"
                                value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />

                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm text-slate-400">Assign Members</label>
                                    <span className="text-xs text-slate-500">
                                        Showing {students.length} / {students.length}
                                    </span>
                                </div>
                                <div className="max-h-48 overflow-y-auto border border-slate-700 rounded p-2 space-y-1">
                                    {students
                                        .map(student => {
                                            const assignedGroup = student.groupId && student.groupId !== formData.id
                                                ? data.find((g: any) => g.id === student.groupId)
                                                : null;

                                            return (
                                                <div key={student.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`student-${student.id}`}
                                                        checked={formData.members?.includes(student.id) ?? false}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked
                                                            const currentMembers = formData.members || []
                                                            if (isChecked) {
                                                                setFormData({ ...formData, members: [...currentMembers, student.id] })
                                                            } else {
                                                                setFormData({ ...formData, members: currentMembers.filter((id: string) => id !== student.id) })
                                                            }
                                                        }}
                                                        className="rounded border-slate-700 bg-slate-800"
                                                    />
                                                    <label htmlFor={`student-${student.id}`} className="text-sm text-slate-300 flex items-center gap-1">
                                                        <span>{student.name} ({student.idNumber})</span>
                                                        {assignedGroup && (
                                                            <span className="text-xs text-amber-500 italic">
                                                                (In: {assignedGroup.name})
                                                            </span>
                                                        )}
                                                    </label>
                                                </div>
                                            )
                                        })}
                                    {students.length === 0 && (
                                        <p className="text-xs text-slate-500">No students found.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-600">{formData.id ? 'Update' : 'Create'} Group</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
