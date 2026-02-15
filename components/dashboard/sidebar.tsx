"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard, FolderKanban, Users, FileText, Settings,
    Database, ChevronLeft, Menu, LogOut, Sparkles
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const adminNavItems = [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/admin/allocations", label: "Allocations", icon: Users },
    { href: "/dashboard/admin/reports", label: "Reports", icon: FileText },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/admin/master-data", label: "Master Data", icon: Database },
]

const facultyNavItems = [
    { href: "/dashboard/faculty", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/faculty/projects", label: "My Projects", icon: FolderKanban },
    { href: "/dashboard/faculty/schedule", label: "Schedule", icon: Users }, // Using Users icon as placeholder or Calendar if available
    { href: "/dashboard/faculty/evaluations", label: "Evaluations", icon: FileText },
]

const studentNavItems = [
    { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/student/project", label: "My Project", icon: FolderKanban },
    { href: "/dashboard/student/tasks", label: "Tasks", icon: FileText },
    { href: "/dashboard/student/schedule", label: "Schedule", icon: Users },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = () => {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
        window.location.href = "/login"
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                {/* Mobile Menu Button */}
                <div className="lg:hidden fixed top-4 left-4 z-50">
                    {mounted ? (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="icon" className="glass-modern hover-glow-cyan active-press">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72 glass-modern border-r border-cyan-500/20">
                                <SidebarContent pathname={pathname} onLogout={handleLogout} isMobile />
                            </SheetContent>
                        </Sheet>
                    ) : (
                        <Button size="icon" className="glass-modern hover-glow-cyan active-press">
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col h-screen glass-modern border-r border-cyan-500/20 sticky top-0 transition-all duration-500 ease-smooth animate-slide-right",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <SidebarContent
                    pathname={pathname}
                    onLogout={handleLogout}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            </aside>
        </>
    )
}

function SidebarContent({
    pathname,
    onLogout,
    isCollapsed = false,
    onToggleCollapse,
    isMobile = false
}: {
    pathname: string
    onLogout: () => void
    isCollapsed?: boolean
    onToggleCollapse?: () => void
    isMobile?: boolean
}) {
    const isFaculty = pathname.startsWith("/dashboard/faculty")
    const isStudent = pathname.startsWith("/dashboard/student")

    let navItems = adminNavItems
    if (isFaculty) navItems = facultyNavItems
    if (isStudent) navItems = studentNavItems

    return (
        <div className="flex flex-col h-full p-4">
            {/* Logo Section */}
            <div className={cn(
                "flex items-center gap-3 mb-8 relative",
                isCollapsed && "justify-center"
            )}>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                    <div className="relative p-3 rounded-xl bg-gradient-primary shadow-lg shadow-cyan-500/30 hover-scale active-press">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                </div>
                {!isCollapsed && (
                    <div>
                        <h1 className="text-xl font-bold text-cyan-400">
                            SPMS
                        </h1>
                        <p className="text-xs text-muted-foreground">Project Management</p>
                    </div>
                )}
            </div>


            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden stagger-item",
                                isCollapsed && "justify-center px-3",
                                isActive
                                    ? "bg-gradient-primary text-white shadow-lg shadow-cyan-500/30"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-shimmer" />
                            )}

                            <Icon className={cn(
                                "h-5 w-5 relative z-10 transition-transform duration-300",
                                isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"
                            )} />

                            {!isCollapsed && (
                                <span className="font-medium relative z-10 animate-slide-left">
                                    {item.label}
                                </span>
                            )}

                            {/* Hover Glow */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Profile Section */}
            <div className={cn(
                "mt-auto pt-4 border-t border-cyan-500/20",
                isCollapsed && "flex justify-center"
            )}>
                <div className={cn(
                    "flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group cursor-pointer",
                    isCollapsed && "flex-col gap-2"
                )}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow" />
                        <Avatar className="h-10 w-10 border-2 border-cyan-500/30 relative">
                            <AvatarFallback className="bg-gradient-primary text-white font-bold text-sm">
                                AD
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 animate-slide-left">
                            <p className="text-sm font-semibold truncate">Admin</p>
                            <p className="text-xs text-muted-foreground truncate">admin@spms.edu</p>
                        </div>
                    )}

                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onLogout}
                        className="hover:bg-red-500/10 hover:text-red-400 transition-colors duration-300 hover-scale active-press"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Collapse Toggle (Desktop Only) */}
            {!isMobile && onToggleCollapse && (
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onToggleCollapse}
                    className="absolute -right-3 top-20 glass-modern border border-cyan-500/20 hover-glow-cyan active-press"
                >
                    <ChevronLeft className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        isCollapsed && "rotate-180"
                    )} />
                </Button>
            )}
        </div>
    )
}
