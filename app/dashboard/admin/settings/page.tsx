"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, User, Settings as SettingsIcon, Shield, Save } from "lucide-react"
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
        const res = await fetch('/api/settings/profile?email=admin@spms.edu');
        if (res.ok) {
            const data = await res.json();
            setProfile({ ...data, bio: 'System Administrator' });
        }
        setLoading(false);
    }

    const handleProfileUpdate = async () => {
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentEmail: 'admin@spms.edu',
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
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none" />

            {/* TopBar */}
            <div className="glass-modern border-b border-cyan-500/20 sticky top-0 z-30 relative">
                <AdminTopBar title="Settings" />
            </div>

            <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto w-full relative z-10">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-cyan-400 animate-slide-down">
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="glass-modern border-cyan-500/20 grid w-full grid-cols-4 lg:w-[500px]">
                        <TabsTrigger value="general" className="data-[state=active]:bg-gradient-to-r data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                            <User className="h-4 w-4 mr-2" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                            <Bell className="h-4 w-4 mr-2" />
                            Alerts
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                            <Lock className="h-4 w-4 mr-2" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="system" className="data-[state=active]:bg-gradient-to-r data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                            <SettingsIcon className="h-4 w-4 mr-2" />
                            System
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-6">
                        {/* General Settings */}
                        <TabsContent value="general" className="space-y-6">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20 border-4 border-violet-500/30 shadow-lg shadow-violet-500/20">
                                            <AvatarFallback className="bg-gradient-to-br bg-gradient-primary text-white text-2xl font-bold">
                                                AD
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-2xl">Profile Information</CardTitle>
                                            <CardDescription>Update your personal details</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            className="glass-modern border-cyan-500/20"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="glass-modern border-cyan-500/20"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            placeholder="admin@spms.edu"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Role</Label>
                                        <Input
                                            id="bio"
                                            className="glass-modern border-cyan-500/20"
                                            value={profile.bio}
                                            disabled
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handleProfileUpdate}
                                        className="bg-gradient-to-r bg-gradient-primary hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-cyan-500/30"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Notifications */}
                        <TabsContent value="notifications" className="space-y-6">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                    <CardDescription>Configure how you receive alerts</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 glass-modern border-cyan-500/20 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive email updates for new projects</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 glass-modern border-cyan-500/20 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Project Updates</Label>
                                            <p className="text-sm text-muted-foreground">Get notified when projects are submitted</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 glass-modern border-cyan-500/20 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">System Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Important system notifications</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security */}
                        <TabsContent value="security" className="space-y-6">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>Update your account password</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Current Password</Label>
                                        <Input
                                            id="current"
                                            type="password"
                                            className="glass-modern border-cyan-500/20"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new">New Password</Label>
                                        <Input
                                            id="new"
                                            type="password"
                                            className="glass-modern border-cyan-500/20"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm">Confirm New Password</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            className="glass-modern border-cyan-500/20"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handlePasswordUpdate}
                                        className="bg-gradient-to-r bg-gradient-primary hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-cyan-500/30"
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Update Password
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* System */}
                        <TabsContent value="system" className="space-y-6">
                            <Card className="glass-modern border-cyan-500/20">
                                <CardHeader>
                                    <CardTitle>System Preferences</CardTitle>
                                    <CardDescription>Configure system-wide settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 glass-modern border-cyan-500/20 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Auto-save</Label>
                                            <p className="text-sm text-muted-foreground">Automatically save changes</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 glass-modern border-cyan-500/20 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Dark Mode</Label>
                                            <p className="text-sm text-muted-foreground">Use dark theme</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 glass-modern border-cyan-500/20 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Compact View</Label>
                                            <p className="text-sm text-muted-foreground">Reduce spacing in lists</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
        </div>
    )
}
