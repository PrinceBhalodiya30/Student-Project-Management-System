import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { saveMom, markAttendance } from "@/app/actions/faculty" // Assuming markAttendance is exported
import { format } from "date-fns"
import { Clock, Users, Save, FileText } from "lucide-react"

// Create markAttendance action if not exists in previous step, I added it in actions/faculty.ts so it should be fine.

async function getMeetingDetails(id: string) {
    return await prisma.meeting.findUnique({
        where: { id },
        include: {
            Project: {
                include: {
                    ProjectGroup: {
                        include: {
                            StudentProfile: {
                                include: {
                                    User: true
                                }
                            }
                        }
                    }
                }
            },
            Attendance: true
        }
    })
}

export default async function MeetingDetailsPage(props: { params: Promise<{ meetingId: string }> }) {
    const params = await props.params
    const meeting = await getMeetingDetails(params.meetingId) // Corrected access to params via props
    if (!meeting) notFound()

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    Meeting Details
                </h1>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                    <span className="font-semibold">{meeting.Project.title}</span>
                    • {format(new Date(meeting.date), "PPP p")}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Minutes of Meeting */}
                <Card className="glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-cyan-400" />
                            Minutes of Meeting
                        </CardTitle>
                        <CardDescription>Record the discussion points and decisions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            "use server"
                            const minutes = formData.get("minutes") as string
                            await saveMom(meeting.id, minutes)
                        }}>
                            <Textarea
                                name="minutes"
                                className="min-h-[200px] bg-white/5 border-cyan-500/20 mb-4"
                                placeholder="Enter meeting minutes..."
                                defaultValue={meeting.minutes || ""}
                            />
                            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                <Save className="mr-2 h-4 w-4" /> Save Minutes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Attendance */}
                <Card className="glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-400" />
                            Attendance
                        </CardTitle>
                        <CardDescription>Mark student attendance for this meeting.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            "use server"
                            // Collect data
                            const attendanceData = meeting.Project.ProjectGroup.StudentProfile.map(student => {
                                const isPresent = formData.get(`present-${student.id}`) === "on"
                                const remarks = formData.get(`remarks-${student.id}`) as string
                                return { studentId: student.id, isPresent, remarks }
                            })

                            await markAttendance(meeting.id, attendanceData)
                        }}>
                            <div className="space-y-6">
                                {meeting.Project.ProjectGroup.StudentProfile.map(student => {
                                    const record = meeting.Attendance.find(a => a.studentId === student.id)
                                    return (
                                        <div key={student.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-cyan-500/10">
                                            <Checkbox
                                                id={`present-${student.id}`}
                                                name={`present-${student.id}`}
                                                defaultChecked={record ? record.isPresent : true}
                                                className="mt-1 data-[state=checked]:bg-cyan-500 border-cyan-500/50"
                                            />
                                            <div className="flex-1 space-y-2">
                                                <Label htmlFor={`present-${student.id}`} className="font-medium text-base cursor-pointer">
                                                    {student.User.fullName}
                                                </Label>
                                                <div className="text-xs text-muted-foreground">{student.idNumber}</div>
                                                <Input
                                                    name={`remarks-${student.id}`}
                                                    placeholder="Remarks (optional)"
                                                    defaultValue={record?.remarks || ""}
                                                    className="h-8 text-xs bg-black/20 border-cyan-500/20"
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <Button type="submit" className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Save className="mr-2 h-4 w-4" /> Save Attendance
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
