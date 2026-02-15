
"use client"

import { useState } from "react"
import { TopBar } from "@/components/dashboard/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, CheckCircle2, Circle, Trash2 } from "lucide-react"

export default function StudentTasksPage() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Draft Initial Architecture', status: 'completed' },
        { id: 2, title: 'Review Literature', status: 'pending' },
        { id: 3, title: 'Prepare Slides for Meet', status: 'pending' },
    ])
    const [newTask, setNewTask] = useState("")

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), title: newTask, status: 'pending' }])
        setNewTask("")
    }

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    }

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id))
    }

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 font-sans">
            <TopBar title="My Tasks" />
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xl">Team Tasks</CardTitle>
                            <CardDescription className="text-slate-400">
                                Manage your internal team to-dos here. (Local Session Only)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Add Task */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a new task..."
                                    className="bg-slate-800 border-slate-700 text-white"
                                    value={newTask}
                                    onChange={e => setNewTask(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTask()}
                                />
                                <Button onClick={addTask} className="bg-blue-600 hover:bg-blue-500">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Task List */}
                            <div className="space-y-2">
                                {tasks.map(task => (
                                    <div key={task.id} className="group flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleTask(task.id)}>
                                            {task.status === 'completed'
                                                ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                : <Circle className="h-5 w-5 text-slate-500" />
                                            }
                                            <span className={`text-sm ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => deleteTask(task.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">No tasks yet. Add one above!</p>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
