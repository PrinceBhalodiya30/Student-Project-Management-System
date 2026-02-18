
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"
import { getStudentTasks, createTask } from "@/app/actions/student"
import { TaskList } from "./task-list"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, CheckSquare } from "lucide-react"
import { FormWithToast } from "@/components/ui/form-with-toast"

export default async function StudentTasksPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const tasks = await getStudentTasks(payload.sub as string)

    return (
        <div className="p-6 space-y-6 animate-fade-in text-foreground">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                My Tasks
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Add Task Form */}
                <div className="md:col-span-1">
                    <Card className="glass-modern border-cyan-500/20 sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-cyan-400" />
                                Add New Task
                            </CardTitle>
                            <CardDescription>Create a personal to-do item.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormWithToast
                                action={async (formData) => {
                                    "use server"
                                    const title = formData.get("title") as string
                                    return await createTask(payload.sub as string, title)
                                }}
                                successMessage="Task added successfully!"
                                className="space-y-4"
                            >
                                <Input
                                    name="title"
                                    placeholder="e.g., Research for Chapter 1"
                                    required
                                    className="bg-white/5 border-cyan-500/20"
                                />
                                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                    Add Task
                                </Button>
                            </FormWithToast>
                        </CardContent>
                    </Card>
                </div>

                {/* Task List */}
                <div className="md:col-span-2">
                    <Card className="glass-modern border-cyan-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-purple-400" />
                                Task List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TaskList initialTasks={tasks} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
