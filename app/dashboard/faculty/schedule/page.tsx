"use client"

import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Plus, MapPin, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function FacultySchedulePage() {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        projectId: "",
        date: "",
        time: ""
    });

    const fetchMeetings = async () => {
        try {
            const res = await fetch('/api/faculty/meetings');
            const data = await res.json();
            if (Array.isArray(data)) setMeetings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/faculty/projects');
            const data = await res.json();
            if (Array.isArray(data)) setMyProjects(data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchMeetings();
        fetchProjects();
    }, []);

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/faculty/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsDialogOpen(false);
                fetchMeetings();
                setFormData({ title: "", projectId: "", date: "", time: "" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Group meetings by date
    const groupedMeetings = meetings.reduce((groups: any, meeting: any) => {
        const date = new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(meeting);
        return groups;
    }, {});

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                <AdminTopBar title="Schedule" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-[1000px] mx-auto w-full relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                        My Schedule
                    </h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20">
                                <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-modern border-slate-700 text-slate-100">
                            <DialogHeader>
                                <DialogTitle>Schedule New Meeting</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateMeeting} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Meeting Title</Label>
                                    <Input
                                        placeholder="e.g. Weekly Sync"
                                        className="bg-slate-800 border-slate-700"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Project Group</Label>
                                    <Select
                                        onValueChange={val => setFormData({ ...formData, projectId: val })}
                                        value={formData.projectId}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-700">
                                            <SelectValue placeholder="Select Project" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                            {myProjects.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            className="bg-slate-800 border-slate-700"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Time</Label>
                                        <Input
                                            type="time"
                                            className="bg-slate-800 border-slate-700"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">Schedule</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    </div>
                ) : Object.keys(groupedMeetings).length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20">
                        <p className="text-slate-400">No upcoming meetings scheduled.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedMeetings).map(([date, items]: [string, any]) => (
                            <div key={date} className="animate-slide-up">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pl-1">{date}</h3>
                                <div className="space-y-4">
                                    {items.map((meeting: any) => (
                                        <Card key={meeting.id} className="glass-modern border-slate-800 hover:border-cyan-500/30 transition-all group overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors" />
                                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-lg font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                                                            {meeting.title}
                                                        </h4>
                                                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                                                            {meeting.Project.title}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4 text-cyan-500" />
                                                            {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin className="h-4 w-4 text-amber-500" />
                                                            Online / Room 302
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                                                    Join / Details
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
