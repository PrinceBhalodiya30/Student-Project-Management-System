import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, CheckCircle, User, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"
import { approveProjectProposal, createMilestone } from "@/app/actions/faculty"
import { format } from "date-fns"
import { FormWithToast } from "@/components/ui/form-with-toast"

async function getProjectDetails(id: string) {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            Type: true,
            ProjectGroup: {
                include: {
                    StudentProfile: {
                        include: {
                            User: true,
                            Grade: {
                                where: { projectId: id }
                            }
                        }
                    }
                }
            },
            Document: true,
            Meeting: {
                orderBy: { date: 'desc' }
            },
            Milestone: true
        }
    })
    return project
}

export default async function ProjectDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const project = await getProjectDetails(params.id)
    if (!project) notFound()

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            {project.title}
                        </h1>
                        <Badge variant="outline" className={`
                            ${project.status === 'APPROVED' ? 'border-green-500 text-green-500' : ''}
                            ${project.status === 'PROPOSED' ? 'border-orange-500 text-orange-500' : ''}
                        `}>
                            {project.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <span className="font-semibold text-foreground">{project.Type.name}</span>
                        • {project.ProjectGroup.name}
                    </p>
                </div>

                {project.status === 'PROPOSED' && (
                    <div className="flex gap-2">
                        <form action={async () => {
                            "use server"
                            await approveProjectProposal(project.id, "REJECTED")
                        }}>
                            <Button variant="destructive">Reject</Button>
                        </form>
                        <form action={async () => {
                            "use server"
                            await approveProjectProposal(project.id, "APPROVED")
                        }}>
                            <Button className="bg-green-600 hover:bg-green-700 text-white">Approve Project</Button>
                        </form>
                    </div>
                )}
                {project.status === 'APPROVED' && (
                    <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25">
                        <Link href={`/dashboard/faculty/projects/${project.id}/assess`}>
                            Grade Students
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle>Project Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="documents" className="w-full">
                        <TabsList className="glass-modern border border-cyan-500/20 p-1">
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="meetings">Meetings</TabsTrigger>
                            <TabsTrigger value="milestones">Milestones</TabsTrigger>
                        </TabsList>

                        <TabsContent value="documents" className="mt-4">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <CardTitle className="text-lg">Project Documents</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {project.Document.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
                                    ) : (
                                        project.Document.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10 group hover:border-cyan-500/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-cyan-400" />
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors font-medium">
                                                        {doc.name}
                                                    </a>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="meetings" className="mt-4">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Meeting History</CardTitle>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={`/dashboard/faculty/meetings?projectId=${project.id}`}>
                                            Schedule New
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {project.Meeting.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No meetings recorded.</p>
                                    ) : (
                                        project.Meeting.map(meeting => (
                                            <div key={meeting.id} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-cyan-500/10">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">{meeting.title}</h4>
                                                    <span className="text-xs text-muted-foreground">{format(new Date(meeting.date), "PPP p")}</span>
                                                </div>
                                                {meeting.minutes && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{meeting.minutes}</p>
                                                )}
                                                <div className="flex justify-end">
                                                    <Button size="sm" variant="ghost" asChild className="h-6 text-xs text-cyan-400 hover:text-cyan-300">
                                                        <Link href={`/dashboard/faculty/meetings/${meeting.id}`}>
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="milestones" className="mt-4">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Milestones</CardTitle>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                                <Plus className="mr-2 h-4 w-4" /> Add Milestone
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="glass-modern border-cyan-500/20">
                                            <DialogHeader>
                                                <DialogTitle>Add New Milestone</DialogTitle>
                                                <DialogDescription>Set a key deliverable and deadline for the project.</DialogDescription>
                                            </DialogHeader>
                                            <FormWithToast
                                                action={async (formData) => {
                                                    "use server"
                                                    const title = formData.get("title") as string
                                                    const dateStr = formData.get("deadline") as string
                                                    return await createMilestone(project.id, title, new Date(dateStr))
                                                }}
                                                successMessage="Milestone created successfully!"
                                            >
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="title">Milestone Title</Label>
                                                        <Input id="title" name="title" placeholder="e.g., Database Design" required className="bg-white/5 border-cyan-500/20" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="deadline">Deadline</Label>
                                                        <Input id="deadline" name="deadline" type="date" required className="bg-white/5 border-cyan-500/20" />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Add Milestone</Button>
                                                </DialogFooter>
                                            </FormWithToast>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent>
                                    {project.Milestone.length === 0 ? (
                                        <p className="text-muted-foreground">No milestones set yet.</p>
                                    ) : (
                                        project.Milestone.map(m => (
                                            <div key={m.id} className="flex items-center gap-3 p-3 border-b border-cyan-500/10 last:border-0">
                                                <CheckCircle className={`h-5 w-5 ${m.isCompleted ? "text-green-500" : "text-muted-foreground"}`} />
                                                <div className="flex-1">
                                                    <p className={`font-medium ${m.isCompleted ? "line-through text-muted-foreground" : ""}`}>{m.title}</p>
                                                    <p className="text-xs text-muted-foreground">Deadline: {format(new Date(m.deadline), "PPP")}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Content */}
                <div className="space-y-6">
                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {project.ProjectGroup.StudentProfile.map(student => (
                                <div key={student.id} className="flex items-center gap-3 pb-3 border-b border-cyan-500/10 last:border-0 last:pb-0">
                                    <div className="bg-gradient-secondary p-2 rounded-full">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{student.User.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{student.idNumber}</p>
                                    </div>
                                    {student.isLeader && (
                                        <Badge variant="secondary" className="text-[10px]">Leader</Badge>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {project.status === 'APPROVED' && (
                        <Card className="glass-modern border-cyan-500/20">
                            <CardHeader>
                                <CardTitle>Grading Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {project.ProjectGroup.StudentProfile.map(student => {
                                        const grade = student.Grade[0]
                                        return (
                                            <div key={student.id} className="flex justify-between items-center text-sm">
                                                <span>{student.User.fullName}</span>
                                                {grade ? (
                                                    <Badge variant="outline" className="border-green-500 text-green-500">
                                                        {grade.marks} / 100
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Not graded</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
