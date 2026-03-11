"use client"

import { useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Megaphone, Send } from "lucide-react"
import { toast } from "sonner"

export default function BroadcastPage() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [audience, setAudience] = useState("ALL")
    const [loading, setLoading] = useState(false)

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !message.trim()) {
            toast.error("Please fill in both title and message.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message, audience })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success(`Message broadcasted successfully to ${data.count} users!`)
                setTitle("")
                setMessage("")
                setAudience("ALL")
            } else {
                toast.error(data.error || "Failed to broadcast message")
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/10 sticky top-0 z-30">
                <AdminTopBar title="Broadcast Messages" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full relative z-10 space-y-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <Megaphone className="h-8 w-8 text-cyan-400" />
                        Broadcast Messages
                    </h1>
                    <p className="text-muted-foreground mt-2">Send system-wide announcements to students and faculty immediately.</p>
                </div>

                <Card className="glass-modern border-white/5 relative overflow-hidden">
                    <CardHeader>
                        <CardTitle>Compose Message</CardTitle>
                        <CardDescription>Messages will show up in the users' notification center instantly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBroadcast} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Target Audience</Label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger className="w-full glass-modern border-cyan-500/20 text-foreground">
                                        <SelectValue placeholder="Select Audience" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-modern border-cyan-500/20 text-foreground">
                                        <SelectItem value="ALL">All Users (Students & Faculty)</SelectItem>
                                        <SelectItem value="STUDENTS">Students Only</SelectItem>
                                        <SelectItem value="FACULTY">Faculty Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Message Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Important Semester Update"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="bg-white/5 border-cyan-500/20 placeholder:text-muted-foreground/50"
                                    maxLength={100}
                                />
                                <p className="text-xs text-muted-foreground max-w-sm text-right">
                                    {title.length}/100
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Broadcast Content</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Write your announcement here..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="bg-white/5 border-cyan-500/20 min-h-[150px] placeholder:text-muted-foreground/50 resize-none"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading || !title.trim() || !message.trim()}
                                    className="bg-gradient-to-r bg-gradient-primary hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-cyan-500/30"
                                >
                                    {loading ? "Broadcasting..." : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Broadcast
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
