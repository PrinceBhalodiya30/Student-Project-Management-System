
"use client"

import { useEffect, useState } from "react"
import { TopBar } from "@/components/dashboard/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar as CalendarIcon, Clock, MapPin, Video } from "lucide-react"

export default function StudentSchedulePage() {
    const [meetings, setMeetings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMeetings()
    }, [])

    const fetchMeetings = async () => {
        try {
            const res = await fetch('/api/student/meetings')
            if (res.ok) {
                const data = await res.json()
                setMeetings(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 font-sans">
            <TopBar title="Schedule" />
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xl">Upcoming Meetings</CardTitle>
                            <CardDescription className="text-slate-400">
                                Scheduled sessions with your Project Guide or Coordinator.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-slate-500">Loading...</p>
                            ) : meetings.length > 0 ? (
                                <div className="space-y-4">
                                    {meetings.map((m) => (
                                        <div key={m.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex gap-4">
                                            <div className="flex flex-col items-center justify-center h-14 w-14 bg-slate-800 rounded-lg border border-slate-700 text-slate-300">
                                                <span className="text-xs font-bold uppercase">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-xl font-bold">{new Date(m.date).getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-medium text-white">{m.title}</h4>
                                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mx-auto h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <CalendarIcon className="h-6 w-6 text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">No Upcoming Meetings</h3>
                                    <p className="text-slate-400 text-sm mt-1">You're all caught up! Check back later.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
