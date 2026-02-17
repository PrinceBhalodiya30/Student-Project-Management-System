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

            <main className="flex-1 p-6 md:p-8 max-w-[1200px] mx-auto w-full relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent selection:text-white selection:bg-cyan-500/20">
                            My Schedule
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage your upcoming meetings and availability.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20">
                                <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-modern border-slate-700 text-slate-100 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Schedule New Meeting</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateMeeting} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Meeting Title</Label>
                                    <Input
                                        placeholder="e.g. Weekly Sync with Team Alpha"
                                        className="bg-slate-950/50 border-slate-700 focus:border-cyan-500/50"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Project Group</Label>
                                    <Select
                                        onValueChange={val => setFormData({ ...formData, projectId: val })}
                                        value={formData.projectId}
                                    >
                                        <SelectTrigger className="bg-slate-950/50 border-slate-700">
                                            <SelectValue placeholder="Select Project" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                                            {myProjects.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Date</Label>
                                        <Input
                                            type="date"
                                            className="bg-slate-950/50 border-slate-700 focus:border-cyan-500/50"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Time</Label>
                                        <Input
                                            type="time"
                                            className="bg-slate-950/50 border-slate-700 focus:border-cyan-500/50"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 shadow-md shadow-cyan-900/20">Schedule Meeting</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    </div>
                ) : Object.keys(groupedMeetings).length === 0 ? (
                    <div className="text-center p-12 glass-modern rounded-xl border-dashed border-slate-700">
                        <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-300">No Meetings Scheduled</h3>
                        <p className="text-slate-500 mt-2">Use the button above to schedule a new meeting with your students.</p>
                    </div>
                ) : (
                    <div className="space-y-8 max-w-3xl">
                        {Object.entries(groupedMeetings).map(([date, items]: [string, any], groupIndex) => (
                            <div key={date} className="animate-slide-up" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
                                <div className="flex items-center gap-4 mb-4">
                                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-900/50">{date}</h3>
                                    <div className="h-px bg-gradient-to-r from-slate-800 to-transparent flex-1" />
                                </div>
                                <div className="space-y-3 pl-4 border-l-2 border-slate-800/50 ml-3">
                                    {items.map((meeting: any) => (
                                        <Card key={meeting.id} className="glass-modern border-slate-800 hover:border-cyan-500/30 transition-all group overflow-hidden hover-float">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-lg font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                                                            {meeting.title}
                                                        </h4>
                                                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 group-hover:border-cyan-500/30 group-hover:text-cyan-400/80 transition-colors">
                                                            {meeting.Project.title}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                        <span className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded text-xs">
                                                            <Clock className="h-3.5 w-3.5 text-cyan-500" />
                                                            {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-xs">
                                                            <MapPin className="h-3.5 w-3.5 text-amber-500" />
                                                            Online / Room 302
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 md:w-auto w-full">
                                                    Join Meeting
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
