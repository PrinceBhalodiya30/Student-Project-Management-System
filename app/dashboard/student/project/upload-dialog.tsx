"use client"

import { useState } from "react"
import { uploadProjectFile } from "@/app/actions/student"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UploadDialogProps {
    userId: string
    projectId: string
}

export function UploadDialog({ userId, projectId }: UploadDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await uploadProjectFile(userId, projectId, formData)

            if (result.success) {
                toast.success("Document uploaded successfully")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to upload document")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">
                    <Upload className="h-4 w-4 mr-2" /> Upload New
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-modern border-cyan-500/20">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>Add a new document to your project repository.</DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Document Name (Optional)</Label>
                        <Input name="name" placeholder="e.g. SRS Report" className="bg-white/5 border-cyan-500/20" />
                    </div>

                    <div className="space-y-2">
                        <Label>Document Type</Label>
                        <Select name="type" required defaultValue="REPORT">
                            <SelectTrigger className="bg-white/5 border-cyan-500/20">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="REPORT">Report</SelectItem>
                                <SelectItem value="PRESENTATION">Presentation</SelectItem>
                                <SelectItem value="CODE">Source Code</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>File</Label>
                        <Input
                            type="file"
                            name="file"
                            required
                            className="bg-white/5 border-cyan-500/20 file:bg-cyan-500/10 file:text-cyan-400 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:text-sm file:font-semibold hover:file:bg-cyan-500/20"
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                        {loading ? "Uploading..." : "Upload"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
