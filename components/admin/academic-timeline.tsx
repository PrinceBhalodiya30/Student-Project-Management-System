"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Clock } from "lucide-react"

export function AcademicTimeline() {
    // Mock data for now, ideally fetched from backend
    const phases = [
        { name: "Project Proposals", status: "completed", date: "Aug 15" },
        { name: "Faculty Allocation", status: "completed", date: "Sep 01" },
        { name: "Mid-Term Review", status: "current", date: "Oct 20", progress: 65 },
        { name: "Final Submission", status: "upcoming", date: "Dec 15" },
        { name: "Viva Voce", status: "upcoming", date: "Jan 10" },
    ]

    return (
        <Card className="col-span-full xl:col-span-3 border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Academic Year Timeline (2025-2026)</CardTitle>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded">
                        Semester 1: Active
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative flex items-center justify-between w-full px-4 pt-4 pb-8">
                    {/* Progress Bar Background (Simpler approach for visuals) */}
                    <div className="absolute top-9 left-0 w-full h-1 bg-muted -z-10 hidden sm:block" />

                    {phases.map((phase, index) => (
                        <div key={index} className="flex flex-col items-center relative z-10 group cursor-default">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300
                                ${phase.status === 'completed' ? 'bg-primary border-primary text-primary-foreground' :
                                    phase.status === 'current' ? 'bg-background border-primary text-primary shadow-lg shadow-primary/20 scale-110' :
                                        'bg-background border-muted text-muted-foreground'}
                             `}>
                                {phase.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                    phase.status === 'current' ? <Clock className="w-5 h-5 animate-pulse" /> :
                                        <Circle className="w-4 h-4" />}
                            </div>

                            <div className="mt-3 text-center">
                                <p className={`text-xs font-bold ${phase.status === 'current' ? 'text-primary' : 'text-foreground'}`}>
                                    {phase.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{phase.date}</p>
                            </div>

                            {phase.status === 'current' && (
                                <div className="absolute -bottom-8 w-24">
                                    <Progress value={phase.progress} className="h-1.5" />
                                    <p className="text-[9px] text-center mt-1 text-muted-foreground">{phase.progress}% Complete</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
