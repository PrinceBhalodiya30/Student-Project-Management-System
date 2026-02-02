"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Lock, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function LoginPage() {
    // Role state is no longer primary driver but can be kept for UI, though logic depends on DB now.
    const [role, setRole] = useState<"admin" | "faculty" | "student">("student")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* Floating Particles */}
            <div className="particles">
                <div className="particle" style={{ width: '100px', height: '100px', top: '10%', left: '10%', animationDelay: '0s' }} />
                <div className="particle" style={{ width: '150px', height: '150px', top: '60%', right: '10%', animationDelay: '2s' }} />
                <div className="particle" style={{ width: '80px', height: '80px', bottom: '20%', left: '20%', animationDelay: '4s' }} />
            </div>

            <div className="z-10 w-full max-w-md p-4 animate-scale-in">
                <div className="flex flex-col items-center justify-center mb-8 space-y-2">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 animate-pulse-slow">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        SPMS Portal
                    </h1>
                </div>

                <Card className="glass-modern border-cyan-500/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

                    <CardContent className="pt-8 pb-8 px-8 relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold tracking-tight mb-2 text-white">
                                Welcome Back
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Please sign in to your project workspace
                            </p>
                        </div>

                        {/* Role Switcher */}
                        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/50 rounded-xl mb-6 border border-slate-800/50">
                            {(["admin", "faculty", "student"] as const).map((r) => (
                                <button
                                    suppressHydrationWarning
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={cn(
                                        "text-xs font-medium py-2 rounded-lg capitalize transition-all duration-300",
                                        role === r
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <form className="space-y-5" onSubmit={async (e) => {
                            e.preventDefault();
                            setError("");
                            setLoading(true);

                            try {
                                const res = await fetch('/api/login', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email, password })
                                });

                                const data = await res.json();

                                if (res.ok) {
                                    window.location.href = `/dashboard/${data.role}`;
                                } else {
                                    setError(data.error || "Login failed");
                                }
                            } catch (err) {
                                setError("Something went wrong");
                            } finally {
                                setLoading(false);
                            }
                        }}>
                            {error && (
                                <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center animate-shake">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2 group">
                                <label className="text-xs font-medium text-cyan-400 ml-1 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative transform transition-all duration-300 group-focus-within:scale-[1.02]">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                                    <Input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        suppressHydrationWarning
                                        placeholder="name@institution.edu"
                                        className="pl-10 h-10 bg-slate-950/50 border-slate-800/60 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-200 placeholder:text-slate-600 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <Link
                                        href="#"
                                        className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative transform transition-all duration-300 group-focus-within:scale-[1.02]">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                                    <Input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        suppressHydrationWarning
                                        placeholder="••••••••"
                                        className="pl-10 h-10 bg-slate-950/50 border-slate-800/60 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-200 placeholder:text-slate-600 rounded-xl"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                suppressHydrationWarning
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white mt-4 h-11 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing In...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign In
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-xs text-slate-400">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-all"
                            >
                                Contact Department
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-xs text-slate-500">
                    © 2024 SPMS Institutional Portal · Privacy · Terms
                </div>
            </div>
        </div>
    )
}
