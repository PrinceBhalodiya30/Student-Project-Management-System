"use client"

import { useState, useEffect } from "react"
import { Search, Bell, User, LogOut, Settings } from "lucide-react"
import { NotificationCenter } from "@/components/dashboard/notification-center"
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
                    <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent animate-slide-down hidden md:block selection:text-white selection:bg-cyan-500/20">
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
                <NotificationCenter />

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
