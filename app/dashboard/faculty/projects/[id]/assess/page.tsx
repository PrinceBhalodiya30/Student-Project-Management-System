import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { gradeStudent } from "@/app/actions/faculty"
import { User, Save } from "lucide-react"
import { FormWithToast } from "@/components/ui/form-with-toast"

async function getProjectForGrading(id: string) {
    return await prisma.project.findUnique({
        where: { id },
        include: {
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
            }
        }
    })
}

export default async function AssessProjectPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const project = await getProjectForGrading(params.id)
    if (!project) notFound()

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    Grade Project: {project.title}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Assess individual performance of student members.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {project.ProjectGroup.StudentProfile.map((student) => {
                    const existingGrade = student.Grade[0]
                    return (
                        <Card key={student.id} className="glass-modern border-cyan-500/20">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="bg-gradient-secondary p-3 rounded-full">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle>{student.User.fullName}</CardTitle>
                                    <CardDescription>{student.idNumber} - {student.department}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <FormWithToast
                                    action={async (formData) => {
                                        "use server"
                                        const marks = parseFloat(formData.get("marks") as string)
                                        const comments = formData.get("comments") as string
                                        return await gradeStudent(student.id, project.id, marks, comments)
                                    }}
                                    successMessage="Grade saved successfully!"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`marks-${student.id}`}>Marks (out of 100)</Label>
                                            <Input
                                                id={`marks-${student.id}`}
                                                name="marks"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                defaultValue={existingGrade?.marks}
                                                required
                                                className="bg-white/5 border-cyan-500/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`comments-${student.id}`}>Comments</Label>
                                            <Textarea
                                                id={`comments-${student.id}`}
                                                name="comments"
                                                defaultValue={existingGrade?.comments || ""}
                                                placeholder="Performance feedback..."
                                                className="bg-white/5 border-cyan-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
                                            <Save className="mr-2 h-4 w-4" /> Save Grade
                                        </Button>
                                    </div>
                                </FormWithToast>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div >
    )
}
