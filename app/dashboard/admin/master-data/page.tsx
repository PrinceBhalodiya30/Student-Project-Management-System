"use client"

import { useState } from "react"
import { User, Users, LayoutGrid, Calendar, Database } from "lucide-react"
import { AdminTopBar } from "@/components/admin/admin-topbar"

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
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="Master Data" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full relative z-10 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br bg-gradient-primary shadow-lg shadow-cyan-500/30">
                        <Database className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-cyan-400 animate-slide-down">
                            Master Data Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Configure institutional data, personnel, and academic timelines</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="glass-modern border-cyan-500/20 p-2 rounded-xl">
                    <div className="flex gap-2 overflow-x-auto">
                        <TabButton label="Departments" active={activeTab === "departments"} onClick={() => setActiveTab("departments")} icon={<LayoutGrid className="w-4 h-4" />} />
                        <TabButton label="Academic Years" active={activeTab === "years"} onClick={() => setActiveTab("years")} icon={<Calendar className="w-4 h-4" />} />
                        <TabButton label="Staff" active={activeTab === "staff"} onClick={() => setActiveTab("staff")} icon={<User className="w-4 h-4" />} />
                        <TabButton label="Students" active={activeTab === "students"} onClick={() => setActiveTab("students")} icon={<Users className="w-4 h-4" />} />
                        <TabButton label="Project Types" active={activeTab === "types"} onClick={() => setActiveTab("types")} icon={<LayoutGrid className="w-4 h-4" />} />
                        <TabButton label="Groups" active={activeTab === "groups"} onClick={() => setActiveTab("groups")} icon={<Users className="w-4 h-4" />} />
                        <TabButton label="Meetings" active={activeTab === "meetings"} onClick={() => setActiveTab("meetings")} icon={<Calendar className="w-4 h-4" />} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === "departments" && <DepartmentTab />}
                    {activeTab === "years" && <AcademicYearTab />}
                    {activeTab === "staff" && <StaffTab />}
                    {activeTab === "students" && <StudentTab />}
                    {activeTab === "types" && <ProjectTypeTab />}
                    {activeTab === "groups" && <ProjectGroupTab />}
                    {activeTab === "meetings" && <MeetingTab />}
                </div>
            </main>
        </div>
    )
}

function TabButton({ label, active, onClick, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${active
                ? "bg-gradient-to-r bg-gradient-primary text-white shadow-lg shadow-cyan-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
        >
            {icon}
            {label}
        </button>
    )
}
