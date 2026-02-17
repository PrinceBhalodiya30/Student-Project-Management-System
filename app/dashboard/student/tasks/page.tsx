"use client"

import { useState, useEffect } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, CheckCircle2, Circle, Trash2, Loader2, CalendarCheck, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function StudentTasksPage() {
    const [tasks, setTasks] = useState<any[]>([])
    const [newTask, setNewTask] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/student/tasks')
            if (res.ok) {
                const data = await res.json()
                setTasks(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const addTask = async () => {
        if (!newTask.trim()) return;
        try {
            const res = await fetch('/api/student/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTask })
            })
            if (res.ok) {
                const task = await res.json()
                setTasks([task, ...tasks]) // Add to top
                setNewTask("")
            }
        } catch (error) {
            console.error(error)
        }
    }

    const toggleTask = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        // Optimistic update
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))

        try {
            await fetch(`/api/student/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
        } catch (error) {
            console.error(error)
            fetchTasks() // Revert on error
        }
    }

    const deleteTask = async (id: string) => {
        // Optimistic update
        const originalTasks = [...tasks];
        setTasks(tasks.filter(t => t.id !== id))

        try {
            await fetch(`/api/student/tasks/${id}`, {
                method: 'DELETE'
            })
        } catch (error) {
            console.error(error)
            setTasks(originalTasks) // Revert on error
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        )
    }

    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background pointer-events-none" />

            <div className="glass-modern border-b border-white/10 sticky top-0 z-30">
                <AdminTopBar title="My Tasks" />
            </div>

            <main className="flex-1 p-6 md:p-8 relative z-10 animate-slide-up">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 glass-modern border-slate-800 bg-gradient-to-r from-indigo-900/40 to-slate-900/40">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-400" />
                                    Task Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-slate-300">
                                        <span>Completion Rate</span>
                                        <span className="font-bold text-white">{progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {completedCount} of {tasks.length} tasks completed
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-modern border-slate-800 flex flex-col justify-center items-center text-center p-6">
                            <div className="p-3 bg-indigo-500/10 rounded-full mb-3 ring-1 ring-indigo-500/30">
                                <CalendarCheck className="h-8 w-8 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">{tasks.length}</h3>
                            <p className="text-sm text-slate-400">Total Tasks</p>
                        </Card>
                    </div>


                    <Card className="glass-modern border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Manage Tasks</CardTitle>
                            <CardDescription className="text-slate-400">
                                Create and track your personal to-dos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Add Task */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="What needs to be done?"
                                    className="bg-slate-900/50 border-slate-700 text-white focus:border-indigo-500/50"
                                    value={newTask}
                                    onChange={e => setNewTask(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTask()}
                                />
                                <Button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Task List */}
                            <div className="space-y-2">
                                {tasks.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                                        <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-50 text-slate-500" />
                                        <p className="text-slate-500">No tasks yet. Add one above!</p>
                                    </div>
                                ) : (
                                    <>
                                        {tasks.map(task => (
                                            <div key={task.id} className="group flex items-center justify-between p-3 rounded-lg bg-white/5 border border-slate-800 hover:bg-white/10 hover:border-slate-700 transition-all duration-200">
                                                <div className="flex items-center gap-3 cursor-pointer select-none flex-1" onClick={() => toggleTask(task.id, task.status)}>
                                                    {task.status === 'completed'
                                                        ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                        : <Circle className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                                    }
                                                    <span className={`text-sm transition-all duration-200 ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteTask(task.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
