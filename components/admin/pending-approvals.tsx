"use client"
import * as React from "react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Eye } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ApprovalItem {
    id: string
    title: string
    type: string
    student: string
    date: string
    studentInitials?: string
}

export function PendingApprovals({ approvals: initialApprovals, loading }: { approvals: ApprovalItem[], loading?: boolean }) {
    const [approvals, setApprovals] = React.useState(initialApprovals);
    const [approvingIds, setApprovingIds] = React.useState<Set<string>>(new Set());

    // Update local state when props change (initial load)
    React.useEffect(() => {
        setApprovals(initialApprovals);
    }, [initialApprovals]);

    const handleApprove = async (id: string) => {
        try {
            setApprovingIds(prev => new Set(prev).add(id));
            const res = await fetch(`/api/projects/${id}/approve`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to approve');

            // Remove from list on success
            setApprovals(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            alert("Failed to approve project. Please try again.");
        } finally {
            setApprovingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    if (loading) {
        return <ApprovalsSkeleton />
    }

    if (approvals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                <p>No pending approvals found</p>
                <p className="text-xs opacity-70">Good job! You're all caught up.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[300px]">Project</TableHead>
                        <TableHead>Student / Group</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {approvals.map((item) => (
                        <TableRow key={item.id} className="group">
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</span>
                                    <Badge variant="outline" className="w-fit mt-1 text-[10px] h-5 px-1.5 font-normal text-muted-foreground border-border/60">{item.type}</Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 border border-border">
                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{item.studentInitials || "ST"}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-foreground/80">{item.student}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">{item.date}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                                        onClick={() => handleApprove(item.id)}
                                        disabled={approvingIds.has(item.id)}
                                    >
                                        {approvingIds.has(item.id) ? (
                                            <span className="animate-spin">...</span>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Approve
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function ApprovalsSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex h-16 items-center gap-4 border-b border-border/50 px-4">
                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded ml-auto" />
                </div>
            ))}
        </div>
    )
}
