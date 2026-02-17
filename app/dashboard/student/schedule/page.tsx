
"use client"

import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, CalendarDays } from "lucide-react"

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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-white/10 sticky top-0 z-30">
                <AdminTopBar title="Schedule" />
            </div>

            <main className="flex-1 p-6 md:p-8 relative z-10 animate-slide-up">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card className="glass-modern border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-blue-400" />
                                Upcoming Meetings
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Scheduled sessions with your Project Guide or Coordinator.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {meetings.length > 0 ? (
                                <div className="space-y-4">
                                    {meetings.map((m) => (
                                        <div key={m.id} className="p-4 rounded-lg bg-white/5 border border-slate-700/50 flex gap-4 hover:bg-white/10 transition-colors group">
                                            <div className="flex flex-col items-center justify-center h-16 w-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl text-white shadow-lg">
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-2xl font-bold leading-none">{new Date(m.date).getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors">{m.title}</h4>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-cyan-400" /> {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-red-400" /> {m.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="mx-auto h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 ring-1 ring-slate-700">
                                        <CalendarIcon className="h-8 w-8 text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1">No Upcoming Meetings</h3>
                                    <p className="text-slate-400 text-sm">You&apos;re all caught up! Check back later.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
