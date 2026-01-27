"use client"

import { useState } from "react"
import { User, Users, LayoutGrid, Calendar } from "lucide-react"

// Import Tab Components
import { StaffTab } from "@/components/admin/master-data/StaffTab"
import { StudentTab } from "@/components/admin/master-data/StudentTab"
import { ProjectTypeTab } from "@/components/admin/master-data/ProjectTypeTab"
import { ProjectGroupTab } from "@/components/admin/master-data/ProjectGroupTab"
import { MeetingTab } from "@/components/admin/master-data/MeetingTab"
import { AcademicYearTab } from "@/components/admin/master-data/AcademicYearTab"
import { DepartmentTab } from "@/components/admin/master-data/DepartmentTab"

export default function MasterDataPage() {
    const [activeTab, setActiveTab] = useState("departments")

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 p-6 font-sans overflow-hidden">
            {/* Header */}
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-white mb-2">Master Data Management</h1>
                <p className="text-slate-400">Configure institutional data, personnel, and academic timelines.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 mb-6 gap-6 overflow-x-auto shrink-0">
                <TabButton label="Departments" active={activeTab === "departments"} onClick={() => setActiveTab("departments")} icon={<LayoutGrid className="w-4 h-4" />} />
                <TabButton label="Academic Years" active={activeTab === "years"} onClick={() => setActiveTab("years")} icon={<Calendar className="w-4 h-4" />} />
                <TabButton label="Staff" active={activeTab === "staff"} onClick={() => setActiveTab("staff")} icon={<User className="w-4 h-4" />} />
                <TabButton label="Students" active={activeTab === "students"} onClick={() => setActiveTab("students")} icon={<Users className="w-4 h-4" />} />
                <TabButton label="Project Types" active={activeTab === "types"} onClick={() => setActiveTab("types")} icon={<LayoutGrid className="w-4 h-4" />} />
                <TabButton label="Groups" active={activeTab === "groups"} onClick={() => setActiveTab("groups")} icon={<Users className="w-4 h-4" />} />
                <TabButton label="Meetings" active={activeTab === "meetings"} onClick={() => setActiveTab("meetings")} icon={<Calendar className="w-4 h-4" />} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10">
                {activeTab === "departments" && <DepartmentTab />}
                {activeTab === "years" && <AcademicYearTab />}
                {activeTab === "staff" && <StaffTab />}
                {activeTab === "students" && <StudentTab />}
                {activeTab === "types" && <ProjectTypeTab />}
                {activeTab === "groups" && <ProjectGroupTab />}
                {activeTab === "meetings" && <MeetingTab />}
            </div>
        </div>
    )
}

function TabButton({ label, active, onClick, icon }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? "border-blue-500 text-blue-500" : "border-transparent text-slate-400 hover:text-white"}`}>
            {icon}
            {label}
        </button>
    )
}
