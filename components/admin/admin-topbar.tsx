"use client"

import { Bell, Search, Settings, HelpCircle, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/dashboard/sidebar" // Reusing sidebar for mobile
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function AdminTopBar({ title }: { title?: string }) {
    const [scrolled, setScrolled] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const [searchResults, setSearchResults] = useState<{ projects: any[], staff: any[], students: any[] } | null>(null)
    const [showResults, setShowResults] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true)
                try {
                    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`)
                    if (res.ok) {
                        const data = await res.json()
                        setSearchResults(data)
                        setShowResults(true)
                    }
                } catch (error) {
                    console.error("Search error", error)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setShowResults(false)
                setSearchResults(null)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery])

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setShowResults(false)
            router.push(`/dashboard/admin/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowResults(false)
        window.addEventListener("click", handleClickOutside)
        return () => window.removeEventListener("click", handleClickOutside)
    }, [])

    return (
        <header
            className="sticky top-0 z-40 flex h-16 w-full items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
                <div>
                    <h1 className="text-lg font-semibold text-foreground">
                        {title || "Admin"}
                    </h1>
                    <p className="text-xs text-muted-foreground hidden md:block">
                        Project Management System
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-80 hidden md:block group" onClick={e => e.stopPropagation()}>
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/admin/search?q=${encodeURIComponent(searchQuery)}`)} />
                    <Input
                        type="search"
                        placeholder="Search anything..."
                        className="pl-10 h-10 bg-muted/40 border-slate-200/50 dark:border-slate-800 focus:bg-background transition-all rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        onFocus={() => { if (searchResults) setShowResults(true) }}
                    />

                    {/* Live Search Results Dropdown */}
                    {showResults && searchResults && (
                        <div className="absolute top-12 left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden text-sm">
                            {isSearching && <div className="p-2 text-center text-muted-foreground text-xs">Searching...</div>}

                            {!isSearching && (
                                <>
                                    {searchResults.projects.length > 0 && (
                                        <div className="p-2">
                                            <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">Projects</div>
                                            {searchResults.projects.map(p => (
                                                <div key={p.id} className="p-2 hover:bg-muted rounded cursor-pointer"
                                                    onClick={() => { setShowResults(false); router.push(`/dashboard/admin/projects/${p.id}`) }}>
                                                    <div className="font-medium text-foreground">{p.title}</div>
                                                    <div className="text-xs text-muted-foreground">{p.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults.staff.length > 0 && (
                                        <div className="p-2 border-t border-border">
                                            <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">Staff</div>
                                            {searchResults.staff.map(s => (
                                                <div key={s.id} className="p-2 hover:bg-muted rounded cursor-pointer"
                                                    onClick={() => { setShowResults(false); setSearchQuery(s.fullName); }}>
                                                    <div className="font-medium text-foreground">{s.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{s.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults.students.length > 0 && (
                                        <div className="p-2 border-t border-border">
                                            <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">Students</div>
                                            {searchResults.students.map(s => (
                                                <div key={s.id} className="p-2 hover:bg-muted rounded cursor-pointer"
                                                    onClick={() => { setShowResults(false); setSearchQuery(s.fullName); }}>
                                                    <div className="font-medium text-foreground">{s.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{s.idNumber}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults.projects.length === 0 && searchResults.staff.length === 0 && searchResults.students.length === 0 && (
                                        <div className="p-4 text-center text-muted-foreground">No results found.</div>
                                    )}

                                    <div className="p-2 border-t border-border bg-muted/20 text-center cursor-pointer hover:bg-muted text-xs text-blue-500"
                                        onClick={() => { setShowResults(false); router.push(`/dashboard/admin/search?q=${encodeURIComponent(searchQuery)}`) }}>
                                        View all results
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-[300px] overflow-y-auto">
                                <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                                    <div className="flex justify-between w-full font-medium text-sm">New Project Proposal <span className="text-xs text-muted-foreground">2m ago</span></div>
                                    <p className="text-xs text-muted-foreground">"AI Attendance System" submitted for review.</p>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                                    <div className="flex justify-between w-full font-medium text-sm">System Update <span className="text-xs text-muted-foreground">1h ago</span></div>
                                    <p className="text-xs text-muted-foreground">Maintenance scheduled for tonight at 2 AM.</p>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                                    <div className="flex justify-between w-full font-medium text-sm">Group Allocation <span className="text-xs text-muted-foreground">5h ago</span></div>
                                    <p className="text-xs text-muted-foreground">Auto-allocation completed for Batch 2024.</p>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center text-blue-600 cursor-pointer">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </div>

                <div className="h-8 w-[1px] bg-border mx-2 hidden md:block"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border-2 border-primary/10">
                                <AvatarImage src="/avatars/01.png" alt="Admin" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">System Admin</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    admin@spms.edu
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/admin/settings')}>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/admin/settings')}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 font-medium cursor-pointer" onClick={() => window.location.href = '/api/logout'}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header >
    )
}
