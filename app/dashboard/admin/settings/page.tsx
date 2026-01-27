"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, User, Settings as SettingsIcon, Shield } from "lucide-react"
import { useState, useEffect } from "react"

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>({ fullName: '', email: '', bio: 'System Administrator' });
    const [loading, setLoading] = useState(true);

    // Password Form State
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        // Mocking session email for now
        const res = await fetch('/api/settings/profile?email=admin@spms.edu');
        if (res.ok) {
            const data = await res.json();
            setProfile({ ...data, bio: 'System Administrator' }); // Bio is static for now
        }
        setLoading(false);
    }

    const handleProfileUpdate = async () => {
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentEmail: 'admin@spms.edu', // Should come from session
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

    return (
        <div className="flex flex-col gap-6 p-6 h-full bg-slate-950 text-slate-100 overflow-y-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
                <p className="text-slate-400">Manage your account settings and set e-mail preferences.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px] bg-slate-900">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle>
                                <CardDescription className="text-slate-400">Update your account's profile information and email address.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-slate-200">Name</Label>
                                    <Input id="name" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-slate-200">Email</Label>
                                    <Input id="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bio" className="text-slate-200">Bio</Label>
                                    <Input id="bio" value={profile.bio} disabled className="bg-slate-950 border-slate-800 text-slate-100 opacity-50" />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-slate-800 pt-4">
                                <Button className="bg-blue-600 hover:bg-blue-500" onClick={handleProfileUpdate}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Notifications Settings (Visual Only) */}
                    <TabsContent value="notifications" className="space-y-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</CardTitle>
                                <CardDescription className="text-slate-400">Configure how you receive notifications.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="new-project" className="flex flex-col space-y-1">
                                        <span className="text-white">New Project Proposals</span>
                                        <span className="font-normal text-xs text-slate-400">Receive emails when new projects are proposed.</span>
                                    </Label>
                                    <Switch id="new-project" defaultChecked />
                                </div>
                                <Separator className="bg-slate-800" />
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="allocations" className="flex flex-col space-y-1">
                                        <span className="text-white">Allocation Updates</span>
                                        <span className="font-normal text-xs text-slate-400">Get notified when auto-allocation completes.</span>
                                    </Label>
                                    <Switch id="allocations" defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2"><Lock className="h-5 w-5" /> Password & Security</CardTitle>
                                <CardDescription className="text-slate-400">Manage your password and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current-password" className="text-slate-200">Current Password</Label>
                                    <Input id="current-password" type="password"
                                        value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="bg-slate-950 border-slate-800 text-slate-100" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-password" className="text-slate-200">New Password</Label>
                                    <Input id="new-password" type="password"
                                        value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="bg-slate-950 border-slate-800 text-slate-100" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm-password" className="text-slate-200">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password"
                                        value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="bg-slate-950 border-slate-800 text-slate-100" />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-slate-800 pt-4">
                                <Button className="bg-blue-600 hover:bg-blue-500" onClick={handlePasswordUpdate}>Update Password</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* System Settings (Visual Only) */}
                    <TabsContent value="system" className="space-y-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2"><SettingsIcon className="h-5 w-5" /> System Configuration</CardTitle>
                                <CardDescription className="text-slate-400">Manage global system settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="academic-year" className="text-slate-200">Current Academic Year</Label>
                                    <Input id="academic-year" defaultValue="2023-2024" className="bg-slate-950 border-slate-800 text-slate-100" />
                                </div>
                                <div className="flex items-center justify-between space-x-2 mt-4">
                                    <Label htmlFor="maintenance" className="flex flex-col space-y-1">
                                        <span className="text-white">Maintenance Mode</span>
                                        <span className="font-normal text-xs text-slate-400">Prevent users from accessing the system during updates.</span>
                                    </Label>
                                    <Switch id="maintenance" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
