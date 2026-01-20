"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Modal } from "@/components/ui/modal"
import { Search, Plus, Upload, Download, Filter, ChevronRight, Edit2, Trash2, Check, X, Calendar, Building2, User } from "lucide-react"

// Types
interface Staff {
    id: string
    userId: string
    name: string
    email: string
    role: string
    department: string
    status: string
    initials: string
}

interface Department {
    id: string
    name: string
    code: string
}

interface AcademicYear {
    id: string
    name: string
    slug: string
    startDate: string
    endDate: string
    isCurrent: boolean
}

export default function MasterDataPage() {
    const [activeTab, setActiveTab] = useState("staff")
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')

    // Data States
    const [staffList, setStaffList] = useState<Staff[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
    const [loading, setLoading] = useState(true)

    // Form States
    const [formData, setFormData] = useState<any>({})
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // Fetch Data
    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (activeTab === "staff") {
                const res = await fetch('/api/staff')
                if (res.ok) setStaffList(await res.json())
            } else if (activeTab === "departments") {
                const res = await fetch('/api/departments')
                if (res.ok) setDepartments(await res.json())
            } else if (activeTab === "years") {
                const res = await fetch('/api/academic-years')
                if (res.ok) setAcademicYears(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    // Handlers
    const handleAdd = () => {
        setModalMode('add')
        setFormData({})
        setShowModal(true)
    }

    const handleEdit = (item: any) => {
        setModalMode('edit')
        // Prioritize userId (for Staff) over id (for Dept/Years) because Staff PUT expects userId
        setSelectedId(item.userId || item.id)
        setFormData(item)
        setShowModal(true)
    }

    const handleDelete = async (id: string, endpoint: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return
        try {
            const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchData() // Refresh list
            } else {
                const errorData = await res.json()
                alert(`Delete failed: ${errorData.error || "Unknown error"}`)
            }
        } catch (error) {
            console.error("Failed to delete", error)
            alert("Delete failed due to network or server error.")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const endpoint = activeTab === 'staff' ? '/api/staff' : activeTab === 'departments' ? '/api/departments' : '/api/academic-years'
        const url = modalMode === 'add' ? endpoint : `${endpoint}/${selectedId}`
        const method = modalMode === 'add' ? 'POST' : 'PUT'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setShowModal(false)
                fetchData()
            } else {
                const errorData = await res.json()
                alert(`Operation failed: ${errorData.error || "Unknown error"}`)
            }
        } catch (error) {
            console.error("Submit error", error)
            alert("Operation failed due to network or server error.")
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 p-6 font-sans">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center text-sm text-slate-400 mb-2">
                    <span>Admin</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-white font-medium">Master Data</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Master Data Management</h1>
                <p className="text-slate-400">Configure institutional data, personnel, and academic timelines.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 mb-6 gap-6">
                <TabButton label="Staff Management" active={activeTab === "staff"} onClick={() => setActiveTab("staff")} icon={<User className="w-4 h-4" />} />
                <TabButton label="Departments" active={activeTab === "departments"} onClick={() => setActiveTab("departments")} icon={<Building2 className="w-4 h-4" />} />
                <TabButton label="Academic Years" active={activeTab === "years"} onClick={() => setActiveTab("years")} icon={<Calendar className="w-4 h-4" />} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between mb-6">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input className="bg-[#1e293b] border-slate-700 pl-10 text-slate-300" placeholder="Search..." />
                    </div>
                    <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-500 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add New {activeTab === 'staff' ? 'Staff' : activeTab === 'departments' ? 'Department' : 'Year'}
                    </Button>
                </div>

                <div className="bg-[#1e293b] rounded-lg border border-slate-800 flex-1 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : (
                        <div className="overflow-y-auto max-h-[60vh]">
                            {activeTab === "staff" && <StaffTable data={staffList} onEdit={handleEdit} onDelete={(id: string) => handleDelete(id, '/api/staff')} />}
                            {activeTab === "departments" && <DepartmentsTable data={departments} onEdit={handleEdit} onDelete={(id: string) => handleDelete(id, '/api/departments')} />}
                            {activeTab === "years" && <YearsTable data={academicYears} onEdit={handleEdit} onDelete={(id: string) => handleDelete(id, '/api/academic-years')} />}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`${modalMode === 'add' ? 'Add' : 'Edit'} ${activeTab === 'staff' ? 'Staff' : activeTab === 'departments' ? 'Department' : 'Academic Year'}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'staff' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Full Name</label>
                                <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-slate-900 border-slate-700" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Email</label>
                                <Input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="bg-slate-900 border-slate-700" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Department</label>
                                <Input value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} className="bg-slate-900 border-slate-700" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Role (Designation)</label>
                                <Input value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} className="bg-slate-900 border-slate-700" required />
                            </div>
                        </>
                    )}
                    {activeTab === 'departments' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Department Name</label>
                                <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-slate-900 border-slate-700" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Code</label>
                                <Input value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} className="bg-slate-900 border-slate-700" required />
                            </div>
                        </>
                    )}
                    {activeTab === 'years' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Name (e.g. 2023-2024)</label>
                                <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-slate-900 border-slate-700" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Slug (e.g. 2023-24)</label>
                                <Input value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="bg-slate-900 border-slate-700" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Start Date</label>
                                    <Input type="date" value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="bg-slate-900 border-slate-700" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">End Date</label>
                                    <Input type="date" value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="bg-slate-900 border-slate-700" required />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" checked={formData.isCurrent || false} onChange={e => setFormData({ ...formData, isCurrent: e.target.checked })} className="rounded bg-slate-900 border-slate-700" />
                                <label className="text-sm text-slate-400">Set as Current Academic Year</label>
                            </div>
                        </>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="hover:bg-slate-800 text-slate-400">Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Save Changes</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

function TabButton({ label, active, onClick, icon }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${active ? "border-blue-500 text-blue-500" : "border-transparent text-slate-400 hover:text-white"}`}>
            {icon}
            {label}
        </button>
    )
}

// Sub-components for Tables
function StaffTable({ data, onEdit, onDelete }: any) {
    return (
        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                    <th className="px-6 py-3">Staff Member</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-blue-600">
                                <AvatarFallback className="text-white bg-blue-600">{item.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-white font-medium">{item.name}</div>
                                <div className="text-xs">{item.role}</div>
                            </div>
                        </td>
                        <td className="px-6 py-4">{item.email}</td>
                        <td className="px-6 py-4">{item.department}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-blue-400" onClick={() => onEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-red-400" onClick={() => onDelete(item.userId)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

function DepartmentsTable({ data, onEdit, onDelete }: any) {
    return (
        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                        <td className="px-6 py-4 font-mono text-xs bg-slate-800 rounded px-2 py-1 w-fit">{item.code}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-blue-400" onClick={() => onEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-red-400" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

function YearsTable({ data, onEdit, onDelete }: any) {
    return (
        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                    <th className="px-6 py-3">Academic Year</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                        <td className="px-6 py-4">
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                            {item.isCurrent && <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Current</Badge>}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-blue-400" onClick={() => onEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-red-400" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
