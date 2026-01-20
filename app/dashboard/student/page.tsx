import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TopBar } from "@/components/dashboard/top-bar"
import { CheckCircle2, Clock, MessageSquare, MoreVertical, Paperclip, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
    return (
        <>
            <TopBar title="Project Overview" />
            <main className="flex-1 overflow-y-auto bg-background p-8">
                {/* Top Section: Hero + Stats */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">

                    {/* Main Hero Card */}
                    <Card className="col-span-2 overflow-hidden border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl relative">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>

                        <CardHeader className="relative z-10 pb-2">
                            <Badge className="w-fit bg-white/20 hover:bg-white/30 text-white border-0 mb-2">THESIS PHASE 2</Badge>
                            <CardTitle className="text-3xl font-bold tracking-tight">AI-Driven UI Optimization</CardTitle>
                            <CardDescription className="text-blue-100/80 text-base mt-2">
                                Supervisor: Dr. Sarah Jenkins • System Architecture Phase
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10 grid grid-cols-3 gap-6 items-end mt-4">
                            <div className="col-span-2 space-y-4">
                                <div className="flex justify-between text-sm font-medium opacity-90">
                                    <span>Overall Progress</span>
                                    <span>65%</span>
                                </div>
                                <Progress value={65} className="h-2 bg-blue-900/30" /> {/* Need to style progress indicator to be white */}
                                <div className="flex items-center gap-2 text-sm text-blue-100/70 mt-4">
                                    <Clock className="h-4 w-4" />
                                    <span>14 days remaining until Mid-term Presentation</span>
                                </div>
                            </div>

                            {/* Circular Progress Mockup */}
                            <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                <div className="relative h-20 w-20 flex items-center justify-center rounded-full border-4 border-white/20 border-t-white">
                                    <span className="text-xl font-bold">65%</span>
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider mt-2 opacity-80">Phase Health</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestone Tracker Card */}
                    <Card className="col-span-1 bg-card border-border shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Milestone Tracker</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Completed Tasks</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-foreground">24</span>
                                        <span className="text-sm text-muted-foreground">/ 36</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Hours Logged</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-foreground">142h</span>
                                        <span className="text-sm text-muted-foreground">this month</span>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border-slate-700" variant="outline">
                                View Detailed Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section: To-Do & Activity */}
                <div className="grid gap-6 md:grid-cols-3">

                    {/* To-Do List */}
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                To-Do Tasks
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">3</Badge>
                            </h3>
                            <Button size="icon" variant="ghost">
                                <Plus className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>

                        {/* Task 1 */}
                        <Card className="bg-card/50 border-border hover:bg-card transition-colors cursor-pointer group">
                            <CardContent className="p-5 flex gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10">HIGH PRIORITY</Badge>
                                        <MoreVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Finalize System Architecture</h4>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">Review feedback from Dr. Jenkins regarding the database schema optimization.</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex -space-x-2">
                                            <Avatar className="h-6 w-6 border-2 border-background">
                                                <AvatarImage src="/avatars/01.png" />
                                                <AvatarFallback>AJ</AvatarFallback>
                                            </Avatar>
                                            <Avatar className="h-6 w-6 border-2 border-background">
                                                <AvatarFallback className="bg-blue-600 text-[10px] text-white">+2</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                            <span className="flex items-center gap-1 hover:text-foreground"><MessageSquare className="h-3 w-3" /> 4</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Task 2 */}
                        <Card className="bg-card/50 border-border hover:bg-card transition-colors cursor-pointer group">
                            <CardContent className="p-5 flex gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/10">DESIGN</Badge>
                                        <MoreVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Complete Literature Review</h4>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">Summarize the recent findings from the 2023 CHI conference papers.</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <Avatar className="h-6 w-6 border-2 border-background">
                                            <AvatarFallback className="bg-slate-700 text-[10px] text-white">ME</AvatarFallback>
                                        </Avatar>
                                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                            <span className="flex items-center gap-1 hover:text-foreground"><Paperclip className="h-3 w-3" /> 2</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar: Deadlines & Activity */}
                    <div className="space-y-6">

                        {/* Deadlines */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Upcoming Deadlines</h3>
                                <span className="text-xs text-blue-500 cursor-pointer hover:underline">VIEW CALENDAR</span>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
                                <div className="flex flex-col items-center justify-center h-10 w-10 bg-red-500/10 rounded-md text-red-500">
                                    <span className="text-[10px] font-bold uppercase">Oct</span>
                                    <span className="text-sm font-bold leading-none">24</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium">Mid-term Presentation</h4>
                                    <p className="text-xs text-muted-foreground">Presentation Hall C • 10:00 AM</p>
                                </div>
                                <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5">2 Days</Badge>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Activity Feed</h3>
                            </div>

                            <div className="relative pl-4 border-l border-border space-y-6">
                                {/* Item 1 */}
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-background"></div>
                                    <p className="text-sm"><span className="font-semibold">Dr. Sarah Jenkins</span> left a comment on <span className="text-blue-500 hover:underline cursor-pointer">Design Specs</span></p>
                                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                                </div>
                                {/* Item 2 */}
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-background"></div>
                                    <p className="text-sm"><span className="font-semibold">Mark Stevens</span> uploaded <span className="text-blue-500 hover:underline cursor-pointer">Icon_Set.zip</span></p>
                                    <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Floating Action Button */}
                <Button className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-500 text-white p-0">
                    <Plus className="h-6 w-6" />
                </Button>
            </main>
        </>
    )
}
