"use client"

import { useState } from "react"
import { deleteProjectFile } from "@/app/actions/student"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface DeleteFileButtonProps {
    userId: string
    documentId: string
    fileName: string
}

export function DeleteFileButton({ userId, documentId, fileName }: DeleteFileButtonProps) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setLoading(true)
        try {
            const result = await deleteProjectFile(userId, documentId)

            if (result.success) {
                toast.success("File deleted successfully")
                setOpen(false)
                // Small delay to allow toast to appear before refresh
                setTimeout(() => {
                    router.refresh()
                }, 1000)
            } else {
                toast.error(result.error || "Failed to delete file")
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
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    title="Delete File"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-modern border-red-500/20 sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-300">
                        Are you sure you want to permanently delete <span className="text-white font-medium">"{fileName}"</span>?
                        <br />
                        <span className="text-red-400/80 text-xs mt-2 block">This action cannot be undone.</span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                    >
                        {loading ? "Deleting..." : "Delete File"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
