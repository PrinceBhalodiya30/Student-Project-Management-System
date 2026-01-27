"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, BookOpen, Check, Shield, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

/*
  NOTE: This component replaces the static mockup.
  It implements a 3-step registration process:
  1. Personal Details
  2. Academic Details
  3. Verification & Submit
*/

export default function RegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<any[]>([])

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        batch: "",
        idNumber: ""
    })

    // Fetch Departments on Mount
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await fetch('/api/departments')
                if (res.ok) {
                    const data = await res.json()
                    setDepartments(data)
                }
            } catch (error) {
                console.error("Failed to fetch departments", error)
            }
        }
        fetchDepts()
    }, [])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            alert("Please fill in all fields")
            return false
        }
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match")
            return false
        }
        return true
    }

    const validateStep2 = () => {
        if (!formData.department || !formData.batch || !formData.idNumber) {
            alert("Please fill in all details")
            return false
        }
        return true
    }

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2)
        if (step === 2 && validateStep2()) setStep(3)
    }

    const handlePrev = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    department: formData.department,
                    batch: formData.batch,
                    idNumber: formData.idNumber
                })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || "Registration failed")
                setLoading(false)
                return
            }

            // Success
            alert("Registration successful! Please login.")
            router.push('/login')

        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Navbar */}
            <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <span className="font-bold text-lg">SPMS</span>
                </div>
                <div className="flex items-center space-x-6 text-sm font-medium text-slate-600">
                    <Link href="/login" className="hover:text-blue-600">Login</Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">

                {/* Stepper */}
                <div className="max-w-2xl w-full mb-12 flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />

                    {/* Step 1 Indicator */}
                    <div className="flex flex-col items-center bg-slate-50 px-2 space-y-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md transition-colors ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {step > 1 ? <Check className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Personal</span>
                    </div>

                    {/* Step 2 Indicator */}
                    <div className="flex flex-col items-center bg-slate-50 px-2 space-y-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md transition-colors ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {step > 2 ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>Academic</span>
                    </div>

                    {/* Step 3 Indicator */}
                    <div className="flex flex-col items-center bg-slate-50 px-2 space-y-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md transition-colors ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>Verify</span>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="w-full max-w-2xl border-none shadow-xl bg-white">
                    <CardContent className="p-12">

                        {/* Step 1: Personal Details */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Personal Details</h1>
                                    <p className="text-slate-500">Let's create your account first.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                    <Input
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="bg-white border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="bg-white border-slate-200"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            className="bg-white border-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                            className="bg-white border-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Academic Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Academic Details</h1>
                                    <p className="text-slate-500">Tell us about your current academic status.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Department</label>
                                        <Select value={formData.department} onValueChange={(val) => handleChange('department', val)}>
                                            <SelectTrigger className="bg-white border-slate-200">
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.name}>{dept.name} ({dept.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Batch</label>
                                        <Select value={formData.batch} onValueChange={(val) => handleChange('batch', val)}>
                                            <SelectTrigger className="bg-white border-slate-200">
                                                <SelectValue placeholder="Select Batch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2021-2025">2021-2025</SelectItem>
                                                <SelectItem value="2022-2026">2022-2026</SelectItem>
                                                <SelectItem value="2023-2027">2023-2027</SelectItem>
                                                <SelectItem value="2024-2028">2024-2028</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Roll Number / ID</label>
                                    <Input
                                        placeholder="e.g. 2024-CSE-001"
                                        value={formData.idNumber}
                                        onChange={(e) => handleChange('idNumber', e.target.value)}
                                        className="bg-white border-slate-200"
                                    />
                                    <p className="text-xs text-blue-600">Your unique institutional ID</p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Verification */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Review & Submit</h1>
                                    <p className="text-slate-500">Please review your information before submitting.</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-lg space-y-4 border border-slate-100">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-500 font-medium">Name:</span>
                                        <span className="col-span-2 font-semibold text-slate-800">{formData.name}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-500 font-medium">Email:</span>
                                        <span className="col-span-2 font-semibold text-slate-800">{formData.email}</span>
                                    </div>
                                    <div className="border-t border-slate-200 my-2" />
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-500 font-medium">Department:</span>
                                        <span className="col-span-2 font-semibold text-slate-800">{formData.department}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-500 font-medium">Batch:</span>
                                        <span className="col-span-2 font-semibold text-slate-800">{formData.batch}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-500 font-medium">ID Number:</span>
                                        <span className="col-span-2 font-semibold text-slate-800">{formData.idNumber}</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex gap-3 text-sm text-blue-700">
                                    <Shield className="h-5 w-5 shrink-0" />
                                    <p>By clicking Register, you confirm that all provided information is accurate and belongs to you.</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
                            <Button
                                variant="ghost"
                                onClick={handlePrev}
                                disabled={step === 1 || loading}
                                className="text-slate-500 hover:text-slate-900"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>

                            {step < 3 ? (
                                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                    Register Account
                                </Button>
                            )}
                        </div>

                    </CardContent>
                </Card>
            </main>

            <footer className="py-6 text-center text-xs text-slate-400">
                © 2024 Student Project Management System
            </footer>
        </div>
    )
}
