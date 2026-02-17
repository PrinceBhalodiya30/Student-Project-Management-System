"use client"

import { useEffect, useState, useRef } from "react"
import { TopBar } from "@/components/dashboard/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

export default function StudentChatPage() {
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
        const interval = setInterval(fetchMessages, 5000);
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
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 font-sans">
            <TopBar title="Project Chat" />

            <main className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden">
                <Card className="bg-slate-900 border-slate-800 flex-1 flex flex-col overflow-hidden">
                    <CardContent className="p-0 flex flex-col h-full">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex items-start gap-3 ${msg.User?.role === 'STUDENT' ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-8 w-8 border border-slate-700">
                                            <AvatarFallback className={`${msg.User?.role === 'FACULTY' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-800 text-slate-300'}`}>
                                                {msg.User?.fullName?.substring(0, 2).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.User?.role === 'STUDENT'
                                                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
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
                                    className="bg-slate-800 border-slate-700 text-white focus-visible:ring-blue-500"
                                />
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
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
