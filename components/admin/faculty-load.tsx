"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface FacultyMember {
    id: string
    name: string
    department: string
    currentLoad: number
    maxLoad: number
}

export function FacultyLoad({ faculty, loading }: { faculty: FacultyMember[], loading: boolean }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                            <div className="h-2 w-full bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (faculty.length === 0) {
        return <div className="text-muted-foreground text-sm py-4">No faculty data available.</div>
    }

    return (
        <div className="space-y-6">
            {faculty.map((f) => {
                const percentage = Math.min(100, (f.currentLoad / f.maxLoad) * 100)
                const isHighLoad = percentage >= 80

                return (
                    <div key={f.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-border">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {f.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-medium leading-none">{f.name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{f.department}</div>
                                </div>
                            </div>
                            <div className="text-xs font-medium tabular-nums">
                                {f.currentLoad} / {f.maxLoad} Projects
                            </div>
                        </div>
                        <Progress
                            value={percentage}
                            className={`h-1.5 ${isHighLoad ? '[&>div]:bg-amber-500' : '[&>div]:bg-success'}`}
                        />
                    </div>
                )
            })}
        </div>
    )
}
