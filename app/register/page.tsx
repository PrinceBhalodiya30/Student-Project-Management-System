"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, Check, Shield, User, Camera, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
    const [step, setStep] = useState(2) // Default to step 2 as per screenshot

    // Force light theme for this page to match screenshot
    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Navbar */}
            <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <span className="font-bold text-lg">SPMS</span>
                </div>
                <div className="flex items-center space-x-6 text-sm font-medium text-slate-600">
                    <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                    <Link href="/projects" className="hover:text-blue-600">Projects</Link>
                    <Link href="/register" className="text-blue-600">Registration</Link>
                    <Link href="/reports" className="hover:text-blue-600">Reports</Link>
                    <div className="h-8 w-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-amber-700" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">

                {/* Stepper */}
                <div className="max-w-2xl w-full mb-12 flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />

                    {/* Step 1: Personal (Completed) */}
                    <div className="flex flex-col items-center bg-slate-50 px-2 space-y-2">
                        <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md">
                            <Check className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Personal</span>
                    </div>

                    {/* Progress Line Active */}
                    <div className="absolute top-1/2 left-0 h-0.5 bg-green-500 w-1/2 -z-10" />

                    {/* Step 2: Academic (Active) */}
                    <div className="flex flex-col items-center bg-slate-50 px-2 space-y-2">
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 border-4 border-slate-50 shadow-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Academic</span>
                    </div>

                    {/* Step 3: Verification (Pending) */}
                    <div className="flex flex-col items-center bg-slate-50 px-2 space-y-2">
                        <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification</span>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="w-full max-w-2xl border-none shadow-xl bg-white">
                    <CardContent className="p-12">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Academic Details</h1>
                            <p className="text-slate-500">Please provide your institutional information to complete the registration.</p>
                        </div>

                        {/* Profile Photo Upload */}
                        <div className="flex justify-center mb-10">
                            <div className="relative h-32 w-32 rounded-full border-2 border-dashed border-blue-200 bg-blue-50 flex flex-col items-center justify-center text-blue-400 cursor-pointer hover:bg-blue-100 transition-colors">
                                <Camera className="h-8 w-8 mb-1" />
                                <span className="text-xs font-medium">Upload</span>
                                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-blue-700">
                                    <Pencil className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-400 -mt-6 mb-8">PNG or JPG up to 5MB (Square recommended)</p>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Department</label>
                                <select className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                    <option>Select Department</option>
                                    <option>Computer Science</option>
                                    <option>Electronics</option>
                                </select>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <span className="h-3 w-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold">i</span>
                                    Select your current major department
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Batch / Admission Year</label>
                                <select className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                    <option>Select Batch</option>
                                    <option>2022-2026</option>
                                    <option>2023-2027</option>
                                </select>
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    Available for project registration
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-8">
                            <label className="text-sm font-semibold text-slate-700">Institutional Roll Number</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-slate-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <Input placeholder="e.g. 2024-CSE-045" className="pl-10 h-11 bg-white border-slate-200 text-slate-900" />
                            </div>
                            <p className="text-xs text-blue-600 font-medium">✨ Format: YYYY-DEPT-ID</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous Step
                            </Button>
                            <div className="space-x-4">
                                <Button variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-50">Save Draft</Button>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>

            </main>

            <footer className="py-6 text-center text-xs text-slate-400">
                © 2024 Student Project Management System. Having trouble? <span className="text-blue-600 cursor-pointer">Contact Support</span>
            </footer>
        </div>
    )
}
