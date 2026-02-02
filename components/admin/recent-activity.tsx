"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Folder, Users, AlertCircle, CheckCircle2 } from "lucide-react"

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

    const getIcon = (type: string) => {
        switch (type) {
            case 'project': return Folder;
            case 'user': return Users;
            case 'alert': return AlertCircle;
            case 'success': return CheckCircle2;
            default: return Folder;
        }
    }

    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="relative space-y-6 ml-2">
                {/* Vertical gradient line */}
                <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gradient-to-b from-cyan-500/50 via-blue-500/30 to-transparent" />

                {activities.map((activity, index) => {
                    const Icon = getIcon(activity.iconType);

                    return (
                        <div key={index} className="relative flex gap-6 group">
                            {/* Timeline Icon */}
                            <div className={cn(
                                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-background transition-all group-hover:scale-110 shadow-lg",
                                activity.iconType === 'project' && "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/30",
                                activity.iconType === 'user' && "bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-500/30",
                                activity.iconType === 'alert' && "bg-gradient-to-br from-amber-600 to-orange-600 shadow-amber-500/30",
                                activity.iconType === 'success' && "bg-gradient-to-br from-emerald-600 to-green-600 shadow-emerald-500/30"
                            )}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col pb-2 flex-1 min-w-0">
                                <span className="text-sm font-semibold text-foreground group-hover:text-cyan-400 transition-colors truncate">
                                    {activity.title}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {activity.desc}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground/60 mt-2 uppercase tracking-wider">
                                    {new Date(activity.time).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}

function ActivitySkeleton() {
    return (
        <div className="space-y-6 pt-2">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                    <div className="h-9 w-9 rounded-xl skeleton shrink-0" />
                    <div className="space-y-2 w-full">
                        <div className="h-4 w-1/2 skeleton" />
                        <div className="h-3 w-3/4 skeleton" />
                    </div>
                </div>
            ))}
        </div>
    )
}
