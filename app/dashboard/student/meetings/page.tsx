import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, Clock, FileText, CheckCircle, XCircle } from "lucide-react"

async function getStudentMeetings(userId: string) {
    const student = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
            ProjectGroup: {
                include: {
                    Project: {
                        select: { id: true }
                    }
                }
            }
        }
    })

    if (!student?.ProjectGroup?.Project) return []

    return await prisma.meeting.findMany({
        where: {
            projectId: student.ProjectGroup.Project.id
        },
        include: {
            Attendance: {
                where: { studentId: student.id }
            }
        },
        orderBy: {
            date: 'desc'
        }
    })
}

export default async function StudentMeetingsPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const meetings = await getStudentMeetings(payload.sub as string)

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Meeting History
            </h1>

            <div className="grid gap-6">
                {meetings.length === 0 ? (
                    <Card className="glass-modern border-cyan-500/20 py-12 text-center">
                        <div className="flex flex-col items-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No meetings recorded</h3>
                        </div>
                    </Card>
                ) : (
                    meetings.map(meeting => {
                        const attendance = meeting.Attendance[0]
                        const isFuture = new Date(meeting.date) > new Date()

                        return (
                            <Card key={meeting.id} className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{meeting.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(meeting.date), "PPP")}
                                                <Clock className="h-4 w-4 ml-2" />
                                                {format(new Date(meeting.date), "p")}
                                            </CardDescription>
                                        </div>
                                        {isFuture ? (
                                            <Badge variant="outline" className="border-blue-500 text-blue-500">Scheduled</Badge>
                                        ) : attendance ? (
                                            <Badge variant="outline" className={attendance.isPresent ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}>
                                                {attendance.isPresent ? "Present" : "Absent"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">No Status</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {meeting.minutes && (
                                        <div className="bg-white/5 p-4 rounded-lg border border-cyan-500/10">
                                            <h4 className="flex items-center gap-2 font-medium mb-2 text-cyan-400">
                                                <FileText className="h-4 w-4" /> Minutes of Meeting
                                            </h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{meeting.minutes}</p>
                                        </div>
                                    )}

                                    {attendance?.remarks && (
                                        <div className="text-sm">
                                            <span className="font-semibold text-muted-foreground">Remarks: </span>
                                            <span>{attendance.remarks}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
