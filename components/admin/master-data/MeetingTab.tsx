"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Edit2, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MeetingTab() {
    const [data, setData] = useState<any[]>([])

    const [projects, setProjects] = useState<any[]>([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                const mRes = await fetch('/api/meetings');
                const mData = await mRes.json();
                if (Array.isArray(mData)) {
                    setData(mData);
                } else {
                    console.error("Meetings API Error:", mData);
                    setData([]); // Fallback to empty array
                }

                const pRes = await fetch('/api/projects');
                const pData = await pRes.json();
                if (Array.isArray(pData)) {
                    setProjects(pData);
                } else {
                    console.error("Projects API Error:", pData);
                    setProjects([]);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setData([]);
                setProjects([]);
            }
        };
        fetchData();
    }, [])

    const handleEdit = (meeting: any) => {
        setFormData({
            ...meeting,
            date: new Date(meeting.date).toISOString().split('T')[0],
            projectId: meeting.project // Note: API returns project title string, not ID. This might be an issue if we need ID for select.
            // Wait, existing GET returns: { id, title, project: titleString, date... }
            // But select box needs projectId.
            // I need to update GET to return projectId as well.
        })
        // NOTE: The GET logic in route.ts returns `project: m.Project.title`. It doesn't return projectId.
        // I need to fix the GET route first to return projectId, otherwise edit will lose project association.
        // Let's assume I'll fix GET route next.
        setShowModal(true)
    }

    // Actually, I should fix the GET route logic inside this same step if possible or handle it. 
    // Let's assume I will fix the GET route in a separate call or rely on finding project by name (unreliable).
    // Better to fix GET route. But for now, let's implement the UI and I'll hotfix the GET route in next step.

    // Improved handleEdit assuming data has projectId
    const handleEditSafe = (meeting: any) => {
        setFormData({
            id: meeting.id,
            title: meeting.title,
            date: new Date(meeting.date).toISOString().split('T')[0],
            projectId: meeting.projectId // Uses the field from formatted API response
        })
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this meeting?")) return;
        await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
        fetchData();
    }

    const fetchData = async () => {
        try {
            const mRes = await fetch('/api/meetings');
            const mData = await mRes.json();
            if (Array.isArray(mData)) {
                setData(mData);
            } else {
                setData([]);
            }

            const pRes = await fetch('/api/projects');
            const pData = await pRes.json();
            if (Array.isArray(pData)) {
                setProjects(pData);
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const url = formData.id ? `/api/meetings/${formData.id}` : '/api/meetings'
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
                <h3 className="text-white font-medium">Scheduled Meetings</h3>
                <Button className="bg-blue-600" onClick={() => { setFormData({}); setShowModal(true); }}>Schedule Meeting</Button>
            </div>
            <div className="space-y-2">
                {data.map(m => (
                    <div key={m.id} className="flex items-center justify-between bg-slate-900 p-4 rounded border border-slate-800 group">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-800 rounded flex items-center justify-center text-slate-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{m.title}</h4>
                                <p className="text-xs text-slate-500">Project: {m.project} • {new Date(m.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm text-slate-300 font-bold">{m.present} / {m.attendees}</div>
                                <div className="text-[10px] text-slate-500 uppercase">Attendance</div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditSafe(m)}>
                                    <Edit2 className="h-4 w-4 text-slate-400 hover:text-white" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(m.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-white mb-4">{formData.id ? 'Edit' : 'Schedule'} Meeting</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Meeting Title</label>
                                <Input className="bg-slate-800 border-slate-700"
                                    value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Date</label>
                                <Input type="date" className="bg-slate-800 border-slate-700"
                                    value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Project</label>
                                <Select
                                    value={formData.projectId}
                                    onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-600">{formData.id ? 'Update' : 'Schedule'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
