import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FolderKanban, Users, Calendar, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react"

async function getFacultyProjects(userId: string) {
    const faculty = await prisma.facultyProfile.findUnique({
        where: { userId },
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
                    _count: {
                        select: {
                            Meeting: true,
                            Milestone: true,
                            Document: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            }
        }
    })
    return faculty?.Project || []
}

export default async function FacultyProjectsPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const projects = await getFacultyProjects(payload.sub as string)

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        My Projects
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and track student projects under your supervision
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No projects assigned</h3>
                        <p className="text-muted-foreground">Projects assigned to you will appear here.</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <Card key={project.id} className="glass-modern border-cyan-500/20 hover:border-cyan-500/40 transition-all hover-scale flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className={`
                                        ${project.status === 'APPROVED' ? 'border-green-500 text-green-500' : ''}
                                        ${project.status === 'PROPOSED' ? 'border-orange-500 text-orange-500' : ''}
                                        ${project.status === 'COMPLETED' ? 'border-blue-500 text-blue-500' : ''}
                                        ${project.status === 'REJECTED' ? 'border-red-500 text-red-500' : ''}
                                    `}>
                                        {project.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(project.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle className="line-clamp-1 text-lg">{project.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {project.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4 text-cyan-400" />
                                        <span>{project.ProjectGroup.name} ({project.ProjectGroup.StudentProfile.length} students)</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="p-2 rounded-lg bg-white/5 border border-cyan-500/10">
                                            <div className="font-bold text-cyan-400">{project._count.Meeting}</div>
                                            <div className="text-muted-foreground">Meetings</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5 border border-cyan-500/10">
                                            <div className="font-bold text-purple-400">{project._count.Milestone}</div>
                                            <div className="text-muted-foreground">Milestones</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5 border border-cyan-500/10">
                                            <div className="font-bold text-orange-400">{project._count.Document}</div>
                                            <div className="text-muted-foreground">Docs</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25">
                                    <Link href={`/dashboard/faculty/projects/${project.id}`}>
                                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
