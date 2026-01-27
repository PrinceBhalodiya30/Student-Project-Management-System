"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
    id: string
    title: string
    desc: string
    time: string
    iconType: 'project' | 'user' | 'alert' | 'success'
}

export function RecentActivity({ activities, loading }: { activities: ActivityItemProps[], loading?: boolean }) {
    if (loading) {
        return <ActivitySkeleton />
    }

    if (activities.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <p>No recent activity</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="relative space-y-6 ml-2">
                {/* Vertical line connecting items */}
                <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-border" />

                {activities.map((activity, index) => (
                    <div key={index} className="relative flex gap-6 group">
                        {/* Timeline Icon */}
                        <div className={cn(
                            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background ring-2 ring-transparent transition-all group-hover:scale-110",
                            activity.iconType === 'project' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                            activity.iconType === 'user' && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                            activity.iconType === 'alert' && "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                            activity.iconType === 'success' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        )}>
                            <div className={cn("h-2.5 w-2.5 rounded-full",
                                activity.iconType === 'project' && "bg-blue-600",
                                activity.iconType === 'user' && "bg-purple-600",
                                activity.iconType === 'alert' && "bg-amber-600",
                                activity.iconType === 'success' && "bg-emerald-600"
                            )} />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col pb-2">
                            <span className="text-sm font-semibold text-foreground">{activity.title}</span>
                            <span className="text-xs text-muted-foreground mt-0.5">{activity.desc}</span>
                            <span className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-wider">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

function ActivitySkeleton() {
    return (
        <div className="space-y-6 pt-2">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="space-y-2 w-full">
                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                    </div>
                </div>
            ))}
        </div>
    )
}
