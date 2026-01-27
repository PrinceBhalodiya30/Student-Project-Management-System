"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DepartmentDistribution({ stats }: { stats: any }) {
    // Mock data fallback
    const departments = [
        { name: "Computer Science", count: stats?.csCount || 45, color: "bg-blue-500" },
        { name: "Information Tech", count: stats?.itCount || 32, color: "bg-indigo-500" },
        { name: "AI & DS", count: stats?.aiCount || 18, color: "bg-purple-500" },
        { name: "Electronics", count: stats?.eceCount || 12, color: "bg-emerald-500" },
    ]

    const total = departments.reduce((acc, curr) => acc + curr.count, 0)

    return (
        <Card className="border-border bg-card h-full">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {departments.map((dept, index) => (
                        <div key={index} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">{dept.name}</span>
                                <span className="text-muted-foreground">{dept.count} Projects</span>
                            </div>
                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${dept.color}`}
                                    style={{ width: `${(dept.count / total) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 mt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{total}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Projects</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{Math.round(total / 4)}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Avg Per Dept</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
