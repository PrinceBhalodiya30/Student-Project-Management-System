"use client"

import { Bell, Search } from "lucide-react"
import { NotificationCenter } from "@/components/dashboard/notification-center"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopBar({ title, user }: { title?: string, user?: any }) {
    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-8">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">{title || "Project Overview"}</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search tasks..."
                        className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>

                <NotificationCenter />

                <div className="flex items-center gap-2 border-l border-border pl-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || "Student"}</p>
                    </div>
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src="/avatars/01.png" alt="@alex" />
                        <AvatarFallback>{user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}
