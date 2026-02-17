"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, UserPlus } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BulkUpload } from "@/components/admin/bulk-upload"
import { toast } from "sonner"

export function StudentTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [isEditing, setIsEditing] = useState(false)

    const [departments, setDepartments] = useState<any[]>([])

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDept, setFilterDept] = useState("ALL");
    const [filterBatch, setFilterBatch] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchStudents()
        fetchDepartments()
    }, [])

    // Derived Logic
    const filteredData = data.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDept === "ALL" || item.department === filterDept;
        const matchesBatch = filterBatch === "ALL" || item.batch === filterBatch;
        return matchesSearch && matchesDept && matchesBatch;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination
    useEffect(() => setCurrentPage(1), [searchTerm, filterDept, filterBatch]);

    // Extract unique batches for filter
    const uniqueBatches = Array.from(new Set(data.map(i => i.batch))).sort();

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments')
            if (res.ok) {
                const json = await res.json()
                setDepartments(json)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students')
            if (res.ok) setData(await res.json())
        } catch (e) {
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (item: any) => {
        setFormData({
            ...item,
            id: item.userId, // Important: Use User ID for updates
            isActive: item.isActive,
            isLeader: item.isLeader,
            password: '********'
        })
        setIsEditing(true)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            // Delete using User ID (which is item.userId from GET)
            const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStudents();
                toast.success("Student deleted successfully")
            } else {
                toast.error("Failed to delete student")
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = isEditing ? `/api/students/${formData.id}` : '/api/students'
        const method = isEditing ? 'PUT' : 'POST'

        try {
            const payload = { ...formData }
            // Remove dummy password if it hasn't been changed
            if (payload.password === '********') {
                delete payload.password
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const json = await res.json();

            if (!res.ok) {
                toast.error(json.error || "Operation failed");
                return;
            }

            fetchStudents()
            setShowModal(false)
            toast.success(isEditing ? "Student updated successfully" : "Student created successfully")
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred");
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                    <Input
                        placeholder="Search students..."
                        className="w-full md:w-64 bg-slate-900 border-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select value={filterDept} onValueChange={setFilterDept}>
                        <SelectTrigger className="w-[150px] bg-slate-900 border-slate-700 h-10">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                            <SelectItem value="ALL">All Depts</SelectItem>
                            {departments.map(d => <SelectItem key={d.id} value={d.code}>{d.code}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterBatch} onValueChange={setFilterBatch}>
                        <SelectTrigger className="w-[120px] bg-slate-900 border-slate-700 h-10">
                            <SelectValue placeholder="Batch" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                            <SelectItem value="ALL">All Batches</SelectItem>
                            {uniqueBatches.map((b: any) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <BulkUpload type="student" onUploadComplete={fetchStudents} />
                    <Button className="bg-blue-600" onClick={() => { setFormData({}); setIsEditing(false); setShowModal(true); }}><UserPlus className="mr-2 h-4 w-4" /> Add Student</Button>
                </div>
            </div>
            <div className="bg-slate-900 rounded border border-slate-800 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">ID Number</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Batch</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No students found matching filters.</td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 text-white font-medium">
                                            {item.name}
                                            {item.isLeader && <span className="ml-2 text-[10px] lowercase bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded border border-purple-500/30">Leader</span>}
                                            {!item.isActive && <span className="ml-2 text-[10px] lowercase bg-red-500/20 text-red-400 px-1 py-0.5 rounded border border-red-500/30">Inactive</span>}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{item.idNumber}</td>
                                        <td className="px-4 py-3">{item.department}</td>
                                        <td className="px-4 py-3">{item.batch}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-400" onClick={() => handleDelete(item.userId)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline" size="sm"
                                className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                                onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline" size="sm"
                                className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                                onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? "Edit Student" : "Add Student"}>
                <div className="bg-slate-900 border border-slate-700 rounded-lg w-full p-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input placeholder="Full Name" className="bg-slate-800 border-slate-700"
                            value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <Input placeholder="Email" type="email" className="bg-slate-800 border-slate-700"
                            value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} required />

                        <div>
                            <Input
                                placeholder="Password"
                                type="password"
                                className="bg-slate-800 border-slate-700"
                                required={!isEditing}
                                value={formData.password || ''}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            {isEditing && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Overwrite to change password.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="ID Number" className="bg-slate-800 border-slate-700"
                                value={formData.idNumber || ''} onChange={e => setFormData({ ...formData, idNumber: e.target.value })} required />
                            <Input placeholder="Batch (e.g. 2024)" className="bg-slate-800 border-slate-700"
                                value={formData.batch || ''} onChange={e => setFormData({ ...formData, batch: e.target.value })} required />
                        </div>

                        <Select
                            value={formData.department}
                            onValueChange={(val) => setFormData({ ...formData, department: val })}
                        >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={d.code}>{d.name} ({d.code})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isLeader"
                                    checked={formData.isLeader || false}
                                    onChange={(e) => setFormData({ ...formData, isLeader: e.target.checked })}
                                    className="rounded border-slate-700 bg-slate-800"
                                />
                                <label htmlFor="isLeader" className="text-sm text-slate-300">Group Leader</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive !== false} // Default true
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="rounded border-slate-700 bg-slate-800"
                                />
                                <label htmlFor="isActive" className="text-sm text-slate-300">Active Account</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600">{isEditing ? "Update Student" : "Add Student"}</Button>
                        </div>
                    </form>
                </div>
            </Modal >
        </div >
    )
}
