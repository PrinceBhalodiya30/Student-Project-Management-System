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

export function FacultyLoad({ facultyLoad = [], loading = false }: { facultyLoad?: FacultyMember[], loading?: boolean }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full skeleton" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 skeleton" />
                            <div className="h-2 w-full skeleton" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (facultyLoad.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-muted-foreground text-sm">No faculty data available.</div>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {facultyLoad.map((f) => {
                const percentage = Math.min(100, (f.currentLoad / f.maxLoad) * 100)
                const isHighLoad = percentage >= 80
                const isMediumLoad = percentage >= 50 && percentage < 80

                return (
                    <div key={f.id} className="flex flex-col gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                                    <AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">
                                        {f.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-semibold leading-none group-hover:text-cyan-400 transition-colors">
                                        {f.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{f.department}</div>
                                </div>
                            </div>
                            <div className="text-xs font-semibold tabular-nums">
                                <span className={
                                    isHighLoad ? "text-amber-400" :
                                        isMediumLoad ? "text-blue-400" :
                                            "text-emerald-400"
                                }>
                                    {f.currentLoad}
                                </span>
                                <span className="text-muted-foreground"> / {f.maxLoad}</span>
                            </div>
                        </div>
                        <div className="relative">
                            <Progress
                                value={percentage}
                                className={`h-2 ${isHighLoad ? '[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500' :
                                    isMediumLoad ? '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500' :
                                        '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500'
                                    }`}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
