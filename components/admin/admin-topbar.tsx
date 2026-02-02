"use client"

import { useState, useEffect } from "react"
import { Search, Bell, User, LogOut, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Notification {
    id: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
}

export function AdminTopBar({ title }: { title?: string }) {
    const [date, setDate] = useState<Date | null>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)

    // Hydration safe date & Fetch Notifications
    useEffect(() => {
        setDate(new Date())
        const timer = setInterval(() => setDate(new Date()), 60000)

        fetchNotifications()

        return () => clearInterval(timer)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error("Failed to fetch notifications")
        }
    }

    const markAllAsRead = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/notifications', { method: 'PATCH' })
            if (res.ok) {
                // Optimistically update UI
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            }
        } catch (error) {
            console.error("Failed to mark read")
        } finally {
            setLoading(false)
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length
    const handleLogout = () => {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
        window.location.href = "/login"
    }

    return (
        <div className="flex items-center justify-between p-4 md:px-8 bg-transparent">
            {/* Title */}
            <div className="flex items-center gap-4">
                {title && (
                    <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-slide-down hidden md:block">
                        {title}
                    </h2>
                )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">

                {/* Date Widget */}
                <div className="hidden md:flex flex-col items-end mr-4 animate-fade-in">
                    <span className="text-sm font-medium text-slate-200">
                        {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-slate-400">
                        {date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="relative glass-modern hover-glow-cyan active-press h-10 w-10 rounded-xl"
                        >
                            <Bell className="h-5 w-5 text-slate-300" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 glass-modern border-cyan-500/20 backdrop-blur-2xl shadow-2xl p-0 mt-2 z-50">
                        <DropdownMenuLabel className="p-4 border-b border-slate-700/50">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-200">Notifications</span>
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                                        {unreadCount} New
                                    </Badge>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} className={`flex gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group ${!n.isRead ? 'bg-slate-800/30' : ''}`}>
                                        <div className={`h-2 w-2 mt-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-600' : 'bg-cyan-500'}`} />
                                        <div className="space-y-1">
                                            <p className={`text-sm font-medium transition-colors ${n.isRead ? 'text-slate-400' : 'text-slate-200 group-hover:text-cyan-400'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-slate-400 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <>
                                <DropdownMenuSeparator className="bg-slate-700/50 m-0" />
                                <div className="p-2 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        disabled={loading}
                                        className="text-xs text-cyan-400 hover:text-cyan-300 w-full"
                                    >
                                        {loading ? "Marking..." : "Mark all as read"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale active-press p-0 overflow-hidden ring-2 ring-cyan-500/20 hover:ring-cyan-500/50 transition-all">
                            <Avatar className="h-full w-full">
                                <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-bold text-sm">
                                    AD
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-modern border-cyan-500/20 backdrop-blur-2xl shadow-2xl mt-2 z-50">
                        <DropdownMenuLabel className="font-normal p-3">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">Administrator</p>
                                <p className="text-xs leading-none text-slate-400">admin@spms.edu</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700/50" />
                        <DropdownMenuItem className="hover:bg-cyan-500/10 focus:bg-cyan-500/10 cursor-pointer text-slate-300 focus:text-cyan-400">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-cyan-500/10 focus:bg-cyan-500/10 cursor-pointer text-slate-300 focus:text-cyan-400">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700/50" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
