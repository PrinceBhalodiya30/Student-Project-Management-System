"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    FolderOpen,
    Users,
    FileBarChart,
    Settings,
    LogOut,
    BookOpen,
    MessageSquare,
    Calendar,
    Flag,
    Plus,
    Folder
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const pathname = usePathname()

    // Determine Role
    const isStudent = pathname?.includes("/dashboard/student")
    const isFaculty = pathname?.includes("/dashboard/faculty")
    const isAdmin = pathname?.includes("/dashboard/admin")

    // Default to student if nothing matches (or handle root dashboard)
    const role = isAdmin ? "admin" : isFaculty ? "faculty" : "student"

    const menulists = {
        admin: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
            { icon: FolderOpen, label: "Allocations", href: "/dashboard/admin/allocations" },
            { icon: Users, label: "Master Data", href: "/dashboard/admin/master-data" },
            { icon: Folder, label: "All Projects", href: "/dashboard/admin/projects" },
            { icon: FileBarChart, label: "Reports", href: "/dashboard/admin/reports" },
            { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
        ],
        faculty: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/faculty" },
            { icon: FolderOpen, label: "Projects", href: "/dashboard/faculty/projects" },
            { icon: Users, label: "Students", href: "/dashboard/faculty/students" },
            { icon: FileBarChart, label: "Reports", href: "/dashboard/faculty/reports" },
            { icon: Calendar, label: "Calendar", href: "/dashboard/faculty/calendar" },
        ],
        student: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
            { icon: MessageSquare, label: "Team Chat", href: "/dashboard/student/chat" },
            { icon: FolderOpen, label: "Resources", href: "/dashboard/student/resources" },
            { icon: Flag, label: "Milestones", href: "/dashboard/student/milestones" },
            { icon: Settings, label: "Settings", href: "/dashboard/student/settings" },
        ]
    }

    const currentMenu = menulists[role as keyof typeof menulists]

    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card text-card-foreground">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-6 gap-2">
                <div className="bg-blue-600 p-1 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight">SPMS {role === 'student' ? 'v2.0' : role.charAt(0).toUpperCase() + role.slice(1)}</span>
                    {role === 'student' && <span className="text-[10px] text-muted-foreground">Workspace v2.0</span>}
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-6">
                <nav className="grid gap-1 px-4">
                    {currentMenu.map((item, index) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Role Specific Extra Sections */}

                {/* Student: Milestones / Project Status */}
                {role === 'student' && (
                    <div className="mt-auto px-4 pb-0">
                        {/* This pushed to bottom, but we want it below nav. Let's use margin top on sibling if needed. */}
                    </div>
                )}
            </div>

            {/* Bottom Section */}
            <div className="border-t border-border p-4">
                {role === 'student' ? (
                    <div className="rounded-xl bg-slate-900 p-4 text-white">
                        <div className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">Active Project</div>
                        <div className="font-semibold text-sm mb-3">Final Year Thesis</div>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-xs h-8">
                            Switch Project
                        </Button>
                    </div>
                ) : role === 'faculty' ? (
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 gap-2">
                        <Plus className="h-4 w-4" />
                        New Announcement
                    </Button>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 rounded-lg hover:bg-muted transition-colors cursor-pointer p-2">
                            <Avatar>
                                <AvatarImage src="/avatars/01.png" />
                                <AvatarFallback>AT</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate text-sm font-medium">Dr. Aris Thorne</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    System Admin
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-2"
                            onClick={async () => {
                                try {
                                    await fetch('/api/logout', { method: 'POST' });
                                    window.location.href = '/login';
                                } catch (error) {
                                    console.error('Logout failed', error);
                                }
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
