"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string | number
    trend?: string
    trendNeutral?: boolean
    chartDots?: boolean
    chartPath?: string
    loading?: boolean
    icon?: React.ReactNode
    color?: "blue" | "indigo" | "purple" | "emerald"
}

export function OverviewStats({ cards }: { cards: StatsCardProps[] }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <StatsCard key={index} {...card} />
            ))}
        </div>
    )
}

function StatsCard({ title, value, trend, trendNeutral, chartDots, chartPath, loading, icon, color = "blue" }: StatsCardProps) {
    const isPositive = trend && trend.startsWith("+")
    const isNegative = trend && trend.startsWith("-")

    const colorStyles = {
        blue: "from-blue-600 to-cyan-500 shadow-blue-500/20",
        indigo: "from-indigo-600 to-violet-500 shadow-indigo-500/20",
        purple: "from-purple-600 to-pink-500 shadow-purple-500/20",
        emerald: "from-emerald-600 to-teal-500 shadow-emerald-500/20",
    }

    return (
        <Card className="overflow-hidden border-border bg-card transition-all hover:shadow-md">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                            colorStyles[color]
                        )}>
                            {icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-muted-foreground">{title}</span>
                            <div className="text-2xl font-bold tracking-tight text-foreground">
                                {loading ? (
                                    <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                                ) : (
                                    value
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    {trend && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "font-medium",
                                isPositive && "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                                isNegative && "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
                                trendNeutral && "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400"
                            )}
                        >
                            {trend} {isPositive ? "▲" : isNegative ? "▼" : ""}
                        </Badge>
                    )}

                    {/* Mini chart visual */}
                    <div className="h-8 w-24">
                        {loading ? (
                            <div className="h-full w-full animate-pulse rounded bg-muted/50" />
                        ) : chartDots ? (
                            <div className="flex h-full items-end gap-1">
                                {[0.3, 0.5, 0.8, 0.4, 0.7, 0.9, 0.6, 0.8].map((h, i) => (
                                    <div
                                        key={i}
                                        className={cn("w-1.5 rounded-t-sm", `bg-${color}-500/50`)}
                                        style={{ height: `${h * 100}%` }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
                                <path
                                    d={chartPath || "M0 15 Q10 5 20 15 T40 10 T60 20 T80 5 T100 15"}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className={cn("opacity-50", `text-${color}-500`)}
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
