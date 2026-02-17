import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { uploadDocument } from "@/app/actions/student"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { FileText, Upload, Calendar, CheckSquare, User } from "lucide-react"
import Link from "next/link"

async function getStudentProject(userId: string) {
    const student = await prisma.studentProfile.findUnique({
        where: { userId },
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
    return student?.ProjectGroup?.Project ? { project: student.ProjectGroup.Project, group: student.ProjectGroup } : null
}

export default async function StudentProjectPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const data = await getStudentProject(payload.sub as string)

    if (!data) {
        return (
            <div className="p-6">
                <Card className="glass-modern border-orange-500/20">
                    <CardHeader>
                        <CardTitle className="text-orange-500">No Project Found</CardTitle>
                        <CardDescription>You need to join a group and submit a proposal first.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard/student/group">Go to Group</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { project, group } = data

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
                        <TabsList className="glass-modern border border-cyan-500/20 p-1">
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="milestones">Milestones</TabsTrigger>
                        </TabsList>

                        <TabsContent value="documents" className="mt-4">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Project Documents</CardTitle>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                                <Upload className="mr-2 h-4 w-4" /> Upload
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="glass-modern border-cyan-500/20">
                                            <DialogHeader>
                                                <DialogTitle>Upload Document</DialogTitle>
                                                <DialogDescription>Upload reports, diagrams, or presentations.</DialogDescription>
                                            </DialogHeader>
                                            <form action={async (formData) => {
                                                "use server"
                                                const name = formData.get("name") as string
                                                const url = formData.get("url") as string
                                                const type = formData.get("type") as string
                                                await uploadDocument(project.id, name, url, type)
                                            }}>
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Document Name</Label>
                                                        <Input id="name" name="name" placeholder="e.g., SRS Report" required className="bg-white/5 border-cyan-500/20" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="type">Type</Label>
                                                        <Select name="type" required>
                                                            <SelectTrigger className="bg-white/5 border-cyan-500/20">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="REPORT">Report</SelectItem>
                                                                <SelectItem value="PRESENTATION">Presentation</SelectItem>
                                                                <SelectItem value="DIAGRAM">Diagram</SelectItem>
                                                                <SelectItem value="CODE">Source Code</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="url">File URL (e.g., Drive/Dropbox)</Label>
                                                        <Input id="url" name="url" placeholder="https://..." required className="bg-white/5 border-cyan-500/20" />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Upload</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {project.Document.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
                                    ) : (
                                        project.Document.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10 group hover:border-cyan-500/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-cyan-400" />
                                                    <div>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors font-medium block">
                                                            {doc.name}
                                                        </a>
                                                        <span className="text-xs text-muted-foreground uppercase">{doc.type}</span>
                                                    </div>
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

                        <TabsContent value="milestones" className="mt-4">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <CardTitle>Milestones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {project.Milestone.length === 0 ? (
                                        <p className="text-muted-foreground">No milestones set by faculty.</p>
                                    ) : (
                                        project.Milestone.map(m => (
                                            <div key={m.id} className="flex items-center gap-3 p-3 border-b border-cyan-500/10 last:border-0">
                                                <CheckSquare className={`h-5 w-5 ${m.isCompleted ? "text-green-500" : "text-muted-foreground"}`} />
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

                <div className="space-y-6">
                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {group.StudentProfile.map(student => (
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
                </div>
            </div>
        </div>
    )
}
