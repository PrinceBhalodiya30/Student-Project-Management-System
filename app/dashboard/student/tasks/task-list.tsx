"use client"

import { useState, useEffect } from "react"
import { updateTaskStatus, deleteTask } from "@/app/actions/student"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Task {
    id: string
    title: string
    status: string
    createdAt: Date
}

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
    const router = useRouter()
    const [tasks, setTasks] = useState<Task[]>(initialTasks)

    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    async function handleStatusChange(taskId: string, currentStatus: string) {
        const newStatus = currentStatus === "pending" ? "completed" : "pending"

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
        ))

        const result = await updateTaskStatus(taskId, newStatus)
        if (result.success) {
            toast.success("Task updated")
            router.refresh()
        } else {
            // Revert on failure
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: currentStatus } : t
            ))
            toast.error("Failed to update task")
        }
    }

    async function handleDelete(taskId: string) {
        // Optimistic update
        const taskToDelete = tasks.find(t => t.id === taskId)
        setTasks(prev => prev.filter(t => t.id !== taskId))

        const result = await deleteTask(taskId)
        if (result.success) {
            toast.success("Task deleted")
            router.refresh()
        } else {
            // Revert on failure
            if (taskToDelete) setTasks(prev => [...prev, taskToDelete])
            toast.error("Failed to delete task")
        }
    }

    const pendingTasks = tasks.filter(t => t.status === "pending")
    const completedTasks = tasks.filter(t => t.status === "completed")

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-orange-400">Pending Tasks ({pendingTasks.length})</h2>
                {pendingTasks.length === 0 && <p className="text-muted-foreground">No pending tasks.</p>}
                {pendingTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={false}
                                onCheckedChange={() => handleStatusChange(task.id, task.status)}
                            />
                            <span className="font-medium">{task.title}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-green-400">Completed ({completedTasks.length})</h2>
                {completedTasks.length === 0 && <p className="text-muted-foreground">No completed tasks.</p>}
                {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-cyan-500/10 opacity-60 hover:opacity-100 transition-all">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={true}
                                onCheckedChange={() => handleStatusChange(task.id, task.status)}
                            />
                            <span className="font-medium line-through decoration-cyan-500">{task.title}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
