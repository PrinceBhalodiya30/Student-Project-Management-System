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
            {/* Logo Area */}
            <div className="flex h-16 items-center border-b border-border px-6 gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight">SPMS Portal</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{role}</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
                <nav className="space-y-1">
                    {currentMenu.map((item, index) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                                )} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-white/50" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Role Specific Extra Sections */}
                {role === 'student' && (
                    <div className="mt-8 px-2">
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                            <h4 className="font-semibold mb-1 relative z-10">Pro Tip</h4>
                            <p className="text-xs text-white/90 mb-3 relative z-10 leading-relaxed">
                                Check your milestones regularly to stay on track!
                            </p>
                            <Button size="sm" variant="secondary" className="w-full h-8 text-xs font-semibold text-indigo-700 hover:bg-white/90">
                                View Milestones
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Profile Section */}
            <div className="p-4 border-t border-border/50 bg-muted/20">
                {role === 'student' ? (
                    <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg">
                        Switch Project
                    </Button>
                ) : (
                    <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-background transition-all border border-transparent hover:border-border cursor-pointer group">
                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                            <AvatarImage src="/avatars/01.png" />
                            <AvatarFallback>US</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden transition-all">
                            <span className="truncate text-sm font-semibold">{titleCase(role)}</span>
                            <span className="truncate text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                View Profile
                            </span>
                        </div>
                        <Settings className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>
        </div>
    )
}

function titleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}
