"use client"

import { useState, useEffect } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, ShieldAlert, FileText, User, Calendar } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState("ALL")

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true)
            try {
                const url = new URL('/api/admin/audit-logs', window.location.origin)
                if (actionFilter !== "ALL") {
                    url.searchParams.set("action", actionFilter)
                }
                const res = await fetch(url.toString())
                if (res.ok) {
                    const data = await res.json()
                    setLogs(data)
                } else {
                    toast.error("Failed to fetch audit logs")
                }
            } catch (error) {
                toast.error("An unexpected error occurred")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [actionFilter])

    const getActionColor = (action: string) => {
        const lower = action.toLowerCase()
        if (lower.includes('create') || lower.includes('approve')) return "emerald"
        if (lower.includes('delete') || lower.includes('reject')) return "blue"
        if (lower.includes('update') || lower.includes('edit')) return "violet"
        return "cyan"
    }

    const uniqueActions = ["ALL", ...Array.from(new Set(logs.map(log => log.action)))]

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 gradient-mesh-modern flex items-center justify-center opacity-20 pointer-events-none" />

            <div className="glass-modern border-b border-cyan-500/10 sticky top-0 z-30">
                <AdminTopBar title="Audit Logs" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-[1700px] mx-auto w-full relative z-10 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                            <ShieldAlert className="h-8 w-8 text-cyan-400" />
                            System Audit Logs
                        </h1>
                        <p className="text-muted-foreground mt-2">Track user actions, system modifications, and security events.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px] glass-modern border-cyan-500/20">
                                <SelectValue placeholder="Action Filter" />
                            </SelectTrigger>
                            <SelectContent className="glass-modern border-cyan-500/20">
                                <SelectItem value="ALL">All Actions</SelectItem>
                                {/* Only show unique actions currently in view for simplicity, or hardcoded */}
                                <SelectItem value="Approve Project">Approve Project</SelectItem>
                                <SelectItem value="Reject Project">Reject Project</SelectItem>
                                <SelectItem value="Assign Guide">Assign Guide</SelectItem>
                                <SelectItem value="Status Update">Status Update</SelectItem>
                                <SelectItem value="Task Created">Task Created</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="glass-modern border-white/5 relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ClipboardList className="h-5 w-5 text-cyan-400" />
                            Recent Activity Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-16 skeleton bg-white/5 rounded-xl border border-white/5" />
                                ))}
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ShieldAlert className="h-10 w-10 mx-auto opacity-20 mb-4" />
                                <p>No audit logs found matching criteria.</p>
                            </div>
                        ) : (
                            <div className="rounded-xl overflow-hidden border border-white/5">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-muted-foreground font-medium border-b border-white/5">
                                        <tr>
                                            <th className="px-5 py-4">Action</th>
                                            <th className="px-5 py-4">Details</th>
                                            <th className="px-5 py-4">Project</th>
                                            <th className="px-5 py-4">User</th>
                                            <th className="px-5 py-4 text-right">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {logs.map((log) => {
                                            const color = getActionColor(log.action)
                                            return (
                                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <Badge variant="outline" className={`border-${color}-500/30 text-${color}-400 bg-${color}-500/5`}>
                                                            {log.action}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-300">
                                                        {log.details || "-"}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <FileText className="h-3.5 w-3.5" />
                                                            <span className="truncate max-w-[200px]">{log.project}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <User className="h-3.5 w-3.5" />
                                                            {log.user}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 text-muted-foreground font-mono text-xs">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {format(new Date(log.date), "MMM dd, yyyy HH:mm")}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
