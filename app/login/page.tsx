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
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background pointer-events-none" />

            <div className="z-10 w-full max-w-md p-4">
                <div className="flex items-center justify-center mb-8 space-x-2">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                    <h1 className="text-2xl font-bold tracking-tight">SPMS</h1>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardContent className="pt-6 pb-8 px-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-semibold tracking-tight mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Please sign in to your project workspace
                            </p>
                        </div>

                        {/* Role Switcher */}
                        <div className="grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-lg mb-6">
                            {(["admin", "faculty", "student"] as const).map((r) => (
                                <button
                                    suppressHydrationWarning
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={cn(
                                        "text-xs font-medium py-2 rounded-md capitalize transition-all",
                                        role === r
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <form className="space-y-4" onSubmit={async (e) => {
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
                                <div className="text-red-500 text-xs bg-red-500/10 p-2 rounded text-center">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        suppressHydrationWarning
                                        placeholder="name@institution.edu"
                                        className="pl-9 bg-background/50 border-border/50 focus-visible:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Password
                                    </label>
                                    <Link
                                        href="#"
                                        className="text-xs text-blue-500 hover:text-blue-400"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        suppressHydrationWarning
                                        placeholder="••••••••"
                                        className="pl-9 bg-background/50 border-border/50 focus-visible:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                suppressHydrationWarning
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-2"
                                size="lg"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-xs text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="text-white hover:underline font-medium"
                            >
                                Contact Department
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-xs text-muted-foreground/50">
                    © 2024 SPMS Institutional Portal · Privacy · Terms
                </div>
            </div>
        </div>
    )
}
