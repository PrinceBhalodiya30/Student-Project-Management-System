"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StaffTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [isEditing, setIsEditing] = useState(false)

    const [departments, setDepartments] = useState<any[]>([])

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDept, setFilterDept] = useState("ALL");
    const [filterRole, setFilterRole] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchStaff()
        fetchDepartments()
    }, [])

    // Derived Logic
    const filteredData = data.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDept === "ALL" || item.department === filterDept;
        const matchesRole = filterRole === "ALL" || item.role === filterRole;
        return matchesSearch && matchesDept && matchesRole;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination
    useEffect(() => setCurrentPage(1), [searchTerm, filterDept, filterRole]);

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

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/staff')
            if (res.ok) setData(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (item: any) => {
        setFormData({
            ...item,
            role: item.role,
            id: item.userId,
            isActive: item.status === 'Active'
        })
        setIsEditing(true)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this staff member?")) return;
        try {
            const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
            if (res.ok) fetchStaff();
        } catch (error) {
            console.error(error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = isEditing ? `/api/staff/${formData.id}` : '/api/staff'
        const method = isEditing ? 'PUT' : 'POST'

        try {
            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            fetchStaff()
            setShowModal(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                    <Input
                        placeholder="Search staff..."
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
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-[150px] bg-slate-900 border-slate-700 h-10">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="Guide">Guide</SelectItem>
                            <SelectItem value="Convener">Convener</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => { setFormData({}); setIsEditing(false); setShowModal(true); }} className="bg-blue-600">Add Staff</Button>
            </div>

            <div className="bg-slate-900 rounded border border-slate-800 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Dept</th>
                                <th className="px-4 py-3">Designation</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No staff found matching filters.</td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 text-white">{item.name}</td>
                                        <td className="px-4 py-3">{item.email}</td>
                                        <td className="px-4 py-3">{item.department}</td>
                                        <td className="px-4 py-3">{item.role}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {item.status}
                                            </span>
                                        </td>
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? "Edit Staff" : "Add Staff"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-300">Full Name</label>
                        <Input
                            required
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <Input
                            required
                            type="email"
                            className="bg-slate-800 border-slate-700 mt-1"
                            value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300">
                            {isEditing ? "Password (leave blank to keep current)" : "Password"}
                        </label>
                        <Input
                            type="password"
                            required={!isEditing}
                            className="bg-slate-800 border-slate-700 mt-1"
                            placeholder={isEditing ? "••••••••" : "Enter password"}
                            value={formData.password || ''}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300">Department</label>
                            <Select
                                value={formData.department}
                                onValueChange={(val) => setFormData({ ...formData, department: val })}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1 text-slate-100">
                                    <SelectValue placeholder="Select Dept" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={d.code}>{d.name} ({d.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300">Designation</label>
                            <Select
                                value={formData.role || 'Guide'}
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1 text-slate-100">
                                    <SelectValue placeholder="Select Designation" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                    <SelectItem value="Guide">Project Guide</SelectItem>
                                    <SelectItem value="Convener">Project Convener</SelectItem>
                                    <SelectItem value="Expert">Subject Expert</SelectItem>
                                    <SelectItem value="Coordinator">Coordinator</SelectItem>
                                    <SelectItem value="ADMIN">System Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive !== false} // Default to true if undefined
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-800"
                        />
                        <label htmlFor="isActive" className="text-sm text-slate-300">Active Account</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600">{isEditing ? "Update Staff" : "Save Staff"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
