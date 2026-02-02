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
        <div className="min-h-screen w-full flex flex-col bg-background text-foreground relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* Floating Particles */}
            <div className="particles">
                <div className="particle" style={{ width: '100px', height: '100px', top: '10%', left: '10%', animationDelay: '0s' }} />
                <div className="particle" style={{ width: '150px', height: '150px', top: '60%', right: '10%', animationDelay: '2s' }} />
                <div className="particle" style={{ width: '80px', height: '80px', bottom: '20%', left: '20%', animationDelay: '4s' }} />
            </div>

            {/* Navbar */}
            <header className="h-16 glass-modern border-b border-cyan-500/20 px-6 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                        <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">SPMS</span>
                </div>
                <div className="flex items-center space-x-6 text-sm font-medium text-slate-400">
                    <Link href="/login" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                        <span>Already have an account?</span>
                        <span className="text-cyan-500 font-semibold hover:underline decoration-cyan-500/50">Login</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

                {/* Stepper */}
                <div className="max-w-2xl w-full mb-12 flex items-center justify-between relative mt-8">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />

                    {/* Active Progress Bar */}
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 -z-10 transition-all duration-500 ease-smooth"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />

                    {/* Step 1 Indicator */}
                    <div className="flex flex-col items-center bg-transparent backdrop-blur-sm px-2 space-y-2 cursor-pointer group" onClick={() => step > 1 && setStep(1)}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-2 ${step >= 1 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-cyan-500/20 scale-110' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                            {step > 1 ? <Check className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step >= 1 ? 'text-cyan-400' : 'text-slate-500'}`}>Personal</span>
                    </div>

                    {/* Step 2 Indicator */}
                    <div className="flex flex-col items-center bg-transparent backdrop-blur-sm px-2 space-y-2 cursor-pointer group" onClick={() => step > 2 && setStep(2)}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-2 ${step >= 2 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-cyan-500/20 scale-110' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                            {step > 2 ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step >= 2 ? 'text-cyan-400' : 'text-slate-500'}`}>Academic</span>
                    </div>

                    {/* Step 3 Indicator */}
                    <div className="flex flex-col items-center bg-transparent backdrop-blur-sm px-2 space-y-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-2 ${step >= 3 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-cyan-500/20 scale-110' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step >= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>Verify</span>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="w-full max-w-2xl glass-modern border-cyan-500/20 shadow-2xl relative overflow-hidden animate-slide-up mb-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <CardContent className="p-12 relative z-10">

                        {/* Step 1: Personal Details */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Personal Details</h1>
                                    <p className="text-slate-400">Let's create your student account first.</p>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <Input
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="bg-slate-950/50 border-slate-800/60 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-200 placeholder:text-slate-600 rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="bg-slate-950/50 border-slate-800/60 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-200 placeholder:text-slate-600 rounded-xl h-11"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider ml-1">Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            className="bg-slate-950/50 border-slate-800/60 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-200 placeholder:text-slate-600 rounded-xl h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider ml-1">Confirm Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                            className="bg-slate-950/50 border-slate-800/60 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-200 placeholder:text-slate-600 rounded-xl h-11"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Academic Details */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Academic Details</h1>
                                    <p className="text-slate-400">Tell us about your current academic status.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider ml-1">Department</label>
                                        <Select value={formData.department} onValueChange={(val) => handleChange('department', val)}>
                                            <SelectTrigger className="bg-slate-950/50 border-slate-800/60 text-slate-200 rounded-xl h-11">
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.name}>{dept.name} ({dept.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider ml-1">Batch</label>
                                        <Select value={formData.batch} onValueChange={(val) => handleChange('batch', val)}>
                                            <SelectTrigger className="bg-slate-950/50 border-slate-800/60 text-slate-200 rounded-xl h-11">
                                                <SelectValue placeholder="Select Batch" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                                <SelectItem value="2021-2025">2021-2025</SelectItem>
                                                <SelectItem value="2022-2026">2022-2026</SelectItem>
                                                <SelectItem value="2023-2027">2023-2027</SelectItem>
                                                <SelectItem value="2024-2028">2024-2028</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider ml-1">Roll Number / ID</label>
                                    <Input
                                        placeholder="e.g. 2024-CSE-001"
                                        value={formData.idNumber}
                                        onChange={(e) => handleChange('idNumber', e.target.value)}
                                        className="bg-slate-950/50 border-slate-800/60 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-200 placeholder:text-slate-600 rounded-xl h-11"
                                    />
                                    <p className="text-xs text-blue-400/80">Your unique institutional ID will be verified.</p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Verification */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Review & Submit</h1>
                                    <p className="text-slate-400">Please review your information before submitting.</p>
                                </div>

                                <div className="bg-slate-900/50 p-6 rounded-2xl space-y-4 border border-slate-800/50 shadow-inner">
                                    <div className="grid grid-cols-3 gap-2 text-sm items-center">
                                        <span className="text-slate-500 font-medium">Name:</span>
                                        <span className="col-span-2 font-semibold text-slate-200">{formData.name}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm items-center">
                                        <span className="text-slate-500 font-medium">Email:</span>
                                        <span className="col-span-2 font-semibold text-slate-200">{formData.email}</span>
                                    </div>
                                    <div className="border-t border-slate-800/50 my-2" />
                                    <div className="grid grid-cols-3 gap-2 text-sm items-center">
                                        <span className="text-slate-500 font-medium">Department:</span>
                                        <span className="col-span-2 font-semibold text-slate-200">{formData.department}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm items-center">
                                        <span className="text-slate-500 font-medium">Batch:</span>
                                        <span className="col-span-2 font-semibold text-slate-200">{formData.batch}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm items-center">
                                        <span className="text-slate-500 font-medium">ID Number:</span>
                                        <span className="col-span-2 font-semibold text-cyan-400">{formData.idNumber}</span>
                                    </div>
                                </div>

                                <div className="bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/20 flex gap-3 text-sm text-cyan-200 items-start">
                                    <Shield className="h-5 w-5 shrink-0 text-cyan-400" />
                                    <p>By clicking Register, you confirm that all provided information is accurate and belongs to you.</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-8 border-t border-slate-800/50 mt-8">
                            <Button
                                variant="ghost"
                                onClick={handlePrev}
                                disabled={step === 1 || loading}
                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>

                            {step < 3 ? (
                                <Button onClick={handleNext} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white min-w-[120px] rounded-xl shadow-lg shadow-cyan-500/25">
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/25">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                    Register Account
                                </Button>
                            )}
                        </div>

                    </CardContent>
                </Card>
            </main>

            <footer className="py-6 text-center text-xs text-slate-600 relative z-10">
                © 2024 Student Project Management System
            </footer>
        </div>
    )
}
