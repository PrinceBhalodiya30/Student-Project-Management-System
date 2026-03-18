import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { saveMom, markAttendance } from "@/app/actions/faculty" // Assuming markAttendance is exported
import { format } from "date-fns"
import { Clock, Users, Save, FileText, Plus } from "lucide-react"

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
                    },
                    Document: true
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

            <div className="grid grid-cols-1 gap-6">
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
                                className="min-h-[300px] bg-white/5 border-cyan-500/20 mb-4"
                                placeholder="Enter meeting minutes..."
                                defaultValue={meeting.minutes || ""}
                            />
                            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                <Save className="mr-2 h-4 w-4" /> Save Minutes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Photo Attachments (The "Photo Screen") */}
            {meeting.Project.Document.filter(doc => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.url)).length > 0 && (
                <Card className="glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-400" />
                            Photo Attachments
                        </CardTitle>
                        <CardDescription>Visual references and project photos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {meeting.Project.Document.filter(doc => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.url)).map(doc => (
                                <div key={doc.id} className="group relative aspect-square rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-zoom-in" onClick={() => window.open(doc.url, '_blank')}>
                                    <img 
                                        src={doc.url} 
                                        alt={doc.name} 
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                        <p className="text-xs font-medium text-white truncate">{doc.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
