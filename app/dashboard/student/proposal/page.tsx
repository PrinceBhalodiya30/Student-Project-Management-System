import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { submitProjectProposal, getProjectTypes } from "@/app/actions/student"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { redirect } from "next/navigation"
import { Send } from "lucide-react"
import { FormWithToast } from "@/components/ui/form-with-toast"

export default async function ProjectProposalPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const student = await prisma.studentProfile.findUnique({
        where: { userId: payload.sub as string },
        include: { ProjectGroup: { include: { Project: true } } }
    })

    if (!student?.ProjectGroup) {
        redirect("/dashboard/student/group")
    }

    if (student.ProjectGroup.Project) {
        redirect("/dashboard/student/project")
    }

    if (!student.isLeader) {
        return (
            <div className="p-6">
                <Card className="glass-modern border-orange-500/20">
                    <CardHeader>
                        <CardTitle className="text-orange-500">Proposal Restricted</CardTitle>
                        <CardDescription>Only the group leader can submit the project proposal.</CardDescription>
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
