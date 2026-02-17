"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'PATCH' });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark notifications read", error);
        }
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={(e) => {
                            e.preventDefault();
                            markAllRead();
                        }}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div key={notification.id} className={`p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-muted/20' : ''}`}>
                                    <div className="flex justify-between gap-2 mb-1">
                                        <h5 className="text-sm font-medium leading-none">{notification.title}</h5>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
