"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, User, Users } from "lucide-react"

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get("q") || ""
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [results, setResults] = useState<{
        projects: any[],
        staff: any[],
        students: any[]
    }>({ projects: [], staff: [], students: [] })

    useEffect(() => {
        if (!query) {
            setResults({ projects: [], staff: [], students: [] })
            setLoading(false)
            return
        }

        const fetchData = async () => {
            setLoading(true)
            try {
                // Optimized API call
                const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()

                if (data.projects) { // Check for valid structure
                    setResults({
                        projects: data.projects,
                        staff: data.staff,
                        students: data.students
                    })
                }

            } catch (error) {
                console.error("Search failed", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [query])

    return (
        <div className="flex flex-col min-h-screen bg-muted/10">
            <div className="bg-background border-b border-border sticky top-0 z-30">
                <AdminTopBar title="Search Results" />
            </div>

            <main className="flex-1 p-6 space-y-8 max-w-[1200px] mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold">Search Results for "{query}"</h1>
                    <p className="text-muted-foreground">
                        Found {results.projects.length + results.staff.length + results.students.length} matches
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Projects Section */}
                        {results.projects.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> Projects ({results.projects.length})
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {results.projects.map((project: any) => (
                                        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => router.push(`/dashboard/admin/projects/${project.id}`)}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg font-medium flex justify-between">
                                                    {project.title}
                                                    <Badge variant={project.status === 'COMPLETED' ? 'default' : 'secondary'}>{project.status}</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                                <div className="mt-2 text-xs text-muted-foreground">ID: {project.id}</div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Staff Section */}
                        {results.staff.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" /> Staff ({results.staff.length})
                                </h2>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {results.staff.map((staff: any) => (
                                        <Card key={staff.id} className="flex items-center p-4 gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{staff.name}</div>
                                                <div className="text-xs text-muted-foreground">{staff.role} • {staff.department}</div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Students Section */}
                        {results.students.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5" /> Students ({results.students.length})
                                </h2>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {results.students.map((student: any) => (
                                        <Card key={student.id} className="flex items-center p-4 gap-4">
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{student.name}</div>
                                                <div className="text-xs text-muted-foreground">{student.idNumber} • {student.batch}</div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {results.projects.length === 0 && results.staff.length === 0 && results.students.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No results found for "{query}". Try a different search term.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
