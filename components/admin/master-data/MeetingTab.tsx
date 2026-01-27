"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        setShowModal(false)
        fetch('/api/meetings').then(r => r.json()).then(setData)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Scheduled Meetings</h3>
                <Button className="bg-blue-600" onClick={() => setShowModal(true)}>Schedule Meeting</Button>
            </div>
            <div className="space-y-2">
                {data.map(m => (
                    <div key={m.id} className="flex items-center justify-between bg-slate-900 p-4 rounded border border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-800 rounded flex items-center justify-center text-slate-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{m.title}</h4>
                                <p className="text-xs text-slate-500">Project: {m.project} • {new Date(m.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-300 font-bold">{m.present} / {m.attendees}</div>
                            <div className="text-[10px] text-slate-500 uppercase">Attendance</div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Schedule Meeting</h3>
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
                                <select className="w-full bg-slate-800 border-slate-700 rounded-md h-10 px-3 text-sm text-white"
                                    value={formData.projectId || ''} onChange={e => setFormData({ ...formData, projectId: e.target.value })} required>
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-600">Schedule</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
