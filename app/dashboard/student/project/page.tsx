import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { uploadProjectFile, submitProjectProposal, getProjectTypes } from "@/app/actions/student"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { FileText, Upload, Calendar, CheckSquare, User, Send, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { UploadDialog } from "./upload-dialog"
import { DeleteFileButton } from "./delete-file-button"
import { FormWithToast } from "@/components/ui/form-with-toast"

export default async function StudentProjectPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const student = await prisma.studentProfile.findUnique({
        where: { userId: payload.sub as string },
        include: {
            ProjectGroup: {
                include: {
                    Project: {
                        include: {
                            Type: true,
                            Document: true,
                            Meeting: { orderBy: { date: 'desc' } },
                            Milestone: true
                        }
                    },
                    StudentProfile: { include: { User: true } }
                }
            }
        }
    })

    if (!student?.ProjectGroup) {
        return (
            <div className="p-6 space-y-6 animate-fade-in text-foreground">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    Project Details
                </h1>
                <Card className="glass-modern border-orange-500/50 bg-orange-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-500">
                            <AlertCircle className="h-5 w-5" />
                            No Group Found
                        </CardTitle>
                        <CardDescription>
                            You must join or create a group before you can submit a project proposal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Link href="/dashboard/student/group">
                                Go to Group Formation <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const project = student.ProjectGroup.Project

    // --- PROPOSAL VIEW (No Project) ---
    if (!project) {
        if (!student.isLeader) {
            return (
                <div className="p-6 space-y-6 animate-fade-in text-foreground">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        Project Proposal
                    </h1>
                    <Card className="glass-modern border-orange-500/20">
                        <CardHeader>
                            <CardTitle className="text-orange-500">Waiting for Proposal</CardTitle>
                            <CardDescription>
                                Your group leader has not submitted a project proposal yet. Please ask your leader to submit it.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )
        }

        const projectTypes = await getProjectTypes()

        return (
            <div className="p-6 space-y-6 animate-fade-in text-foreground">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    Submit Project Proposal
                </h1>

                <Card className="max-w-3xl glass-modern border-cyan-500/20">
                    <CardHeader>
                        <CardTitle>Proposal Details</CardTitle>
                        <CardDescription>
                            Submit your project idea for faculty approval. Ensuring clarity helps in faster approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormWithToast
                            action={async (formData) => {
                                "use server"
                                const title = formData.get("title") as string
                                const description = formData.get("description") as string
                                const typeId = formData.get("typeId") as string
                                return await submitProjectProposal(payload.sub as string, { title, description, typeId })
                            }}
                            successMessage="Proposal submitted successfully!"
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="title">Project Title</Label>
                                <Input id="title" name="title" placeholder="Enter concise title" required className="bg-white/5 border-cyan-500/20" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="typeId">Project Area (Domain)</Label>
                                <Select name="typeId" required>
                                    <SelectTrigger className="bg-white/5 border-cyan-500/20">
                                        <SelectValue placeholder="Select domain" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectTypes.map(type => (
                                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe the problem, solution, and technologies..."
                                    required
                                    className="min-h-[150px] bg-white/5 border-cyan-500/20"
                                />
                            </div>

                            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                <Send className="mr-2 h-4 w-4" /> Submit Proposal
                            </Button>
                        </FormWithToast>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // --- DETAILS VIEW (Project Exists) ---
    const group = student.ProjectGroup

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
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
                        • {group.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="documents" className="w-full">
                        <TabsList className="bg-white/5 border border-cyan-500/20">
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="milestones">Milestones</TabsTrigger>
                        </TabsList>

                        <TabsContent value="documents" className="space-y-4 mt-4">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Project Documents</CardTitle>
                                    <UploadDialog userId={payload.sub as string} projectId={project.id} />
                                </CardHeader>
                                <CardContent>
                                    {project.Document.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No documents uploaded yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {project.Document.map(doc => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-blue-500/20 p-2 rounded">
                                                            <FileText className="h-4 w-4 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{doc.name}</p>
                                                            <p className="text-xs text-muted-foreground">{format(new Date(doc.uploadedAt), "MMM d, yyyy")}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">View</a>
                                                        </Button>
                                                        <DeleteFileButton
                                                            userId={payload.sub as string}
                                                            documentId={doc.id}
                                                            fileName={doc.name}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="milestones" className="space-y-4 mt-4">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <CardTitle>Project Milestones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {project.Milestone.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No milestones defined yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {project.Milestone.map(milestone => (
                                                <div key={milestone.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-cyan-500/10">
                                                    <div className={`mt-1 p-1 rounded-full ${milestone.isCompleted ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                                        <CheckSquare className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">{milestone.title}</h4>
                                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                            <span>Due: {format(new Date(milestone.deadline), "MMM d, yyyy")}</span>
                                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                                {milestone.isCompleted ? 'Completed' : 'Pending'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {group.StudentProfile.map(member => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="bg-gradient-secondary p-2 rounded-full">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{member.User.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{member.idNumber}</p>
                                        </div>
                                        {member.isLeader && (
                                            <Badge variant="secondary" className="ml-auto text-xs bg-yellow-500/10 text-yellow-500">Leader</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle>Recent Meetings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {project.Meeting.slice(0, 3).map(meeting => (
                                    <div key={meeting.id} className="flex items-center gap-3">
                                        <div className="bg-purple-500/20 p-2 rounded-lg">
                                            <Calendar className="h-4 w-4 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{meeting.title}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(meeting.date), "MMM d, HH:mm")}</p>
                                        </div>
                                    </div>
                                ))}
                                {project.Meeting.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center">No meetings scheduled.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
