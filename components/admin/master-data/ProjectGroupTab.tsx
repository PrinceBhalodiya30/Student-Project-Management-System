"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react"

export function ProjectGroupTab() {
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/project-groups').then(r => r.json()).then(setData)
    }, [])

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Convert comma separated logic if needed, but for now just pass text or logic
        // API expects "members": ["id1", "id2"]
        // We'll simplisticly assume user enters ID strings or we skip members for now if complex
        // For strict members, we'd need to parse.
        // Let's assume we just create the group name first.
        await fetch('/api/project-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        setShowModal(false)
        // Refresh logic needed (refetch)
        fetch('/api/project-groups').then(r => r.json()).then(setData)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Project Groups</h3>
                <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setShowModal(true)}>New Group</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map(group => (
                    <div key={group.id} className="bg-slate-900 p-4 rounded border border-slate-800">
                        <div className="flex justify-between items-start mb-2">
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
                        <h3 className="text-lg font-bold text-white mb-4">Create Project Group</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input placeholder="Group Name" className="bg-slate-800 border-slate-700"
                                value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />

                            {/* Member assignment placeholder */}
                            <p className="text-xs text-slate-500">Note: Assign students after creating the group or via Student Management.</p>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-600">Create Group</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
