"use client"

import { useEffect, useState, useRef } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User as UserIcon } from "lucide-react"

export default function FacultyChatPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });

            if (res.ok) {
                setNewMessage("");
                fetchMessages();
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    }

    return (
        <div className="flex flex-col h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30">
                <AdminTopBar title="Team Chat" />
            </div>

            <main className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full relative z-10 flex flex-col h-[calc(100vh-80px)]">
                <Card className="glass-modern border-slate-800 flex-1 flex flex-col overflow-hidden">
                    <CardContent className="p-0 flex flex-col h-full">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex items-start gap-3 ${msg.User?.role === 'FACULTY' ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-8 w-8 border border-slate-700">
                                            <AvatarFallback className={`${msg.User?.role === 'FACULTY' ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-300'}`}>
                                                {msg.User?.fullName?.substring(0, 2).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.User?.role === 'FACULTY'
                                                ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-100'
                                                : 'bg-slate-800 border border-slate-700 text-slate-200'
                                            }`}>
                                            <div className="flex justify-between items-center gap-4 mb-1">
                                                <span className="text-xs font-bold opacity-70">{msg.User?.fullName}</span>
                                                <span className="text-[10px] opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-slate-800 bg-black/20">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="bg-slate-900/50 border-slate-700 text-white focus-visible:ring-cyan-500"
                                />
                                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
