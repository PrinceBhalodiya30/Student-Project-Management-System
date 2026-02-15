"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Lock, User, Save, ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>({ fullName: '', email: '', bio: 'System Administrator' });
    const [loading, setLoading] = useState(true);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/settings/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile({ ...data, bio: 'System Administrator' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleProfileUpdate = async () => {
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentEmail: profile.email,
                    name: profile.fullName,
                    email: profile.email
                })
            });
            if (res.ok) alert("Profile updated!");
            else alert("Failed to update profile");
        } catch (e) {
            alert("Error updating profile");
        }
    }

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match");
            return;
        }

        try {
            const res = await fetch('/api/settings/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: profile.email,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const json = await res.json();
            if (res.ok) {
                alert("Password updated successfully");
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(json.error || "Failed to update password");
            }
        } catch (e) {
            alert("Error updating password");
        }
    }

    if (loading) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="Settings" />
            </div>

            <main className="flex-1 p-6 md:p-8 max-w-[1200px] mx-auto w-full relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent selection:text-white selection:bg-cyan-500/20">
                        Account Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">Update your profile and security preferences.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Section */}
                    <Card className="glass-modern border-cyan-500/20 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-cyan-400" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>Update your personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-center">
                                <Avatar className="h-24 w-24 border-4 border-cyan-500/20 shadow-xl shadow-cyan-500/10">
                                    <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-3xl font-bold">
                                        {profile.fullName?.substring(0, 2).toUpperCase() || "AD"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        className="bg-slate-900/50 border-cyan-500/20 focus-visible:ring-cyan-500/50"
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="bg-slate-900/50 border-cyan-500/20 focus-visible:ring-cyan-500/50"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-4 border-t border-cyan-500/10">
                            <Button onClick={handleProfileUpdate} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20">
                                <Save className="h-4 w-4 mr-2" /> Save Profile
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Security Section */}
                    <Card className="glass-modern border-cyan-500/20 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>Ensure your account stays secure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input
                                    id="current"
                                    type="password"
                                    className="bg-slate-900/50 border-cyan-500/20 focus-visible:ring-cyan-500/50"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    className="bg-slate-900/50 border-cyan-500/20 focus-visible:ring-cyan-500/50"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm New Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    className="bg-slate-900/50 border-cyan-500/20 focus-visible:ring-cyan-500/50"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-4 border-t border-cyan-500/10">
                            <Button onClick={handlePasswordUpdate} variant="outline" className="border-cyan-500/20 hover:bg-cyan-500/10 text-cyan-400">
                                <Lock className="h-4 w-4 mr-2" /> Update Password
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}
