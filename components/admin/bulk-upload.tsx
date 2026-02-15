import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Upload, AlertCircle, CheckCircle, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BulkUploadProps {
    type: "student" | "faculty"
    onUploadComplete: () => void
}

export function BulkUpload({ type, onUploadComplete }: BulkUploadProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [csvData, setCsvData] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleUpload = async () => {
        if (!csvData.trim()) return

        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, csvData })
            })

            const data = await res.json()
            setResult(data)

            if (data.success) {
                setCsvData("")
                onUploadComplete()
            }
        } catch (error) {
            setResult({ success: false, message: "Upload failed due to network error" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="glass-modern border-cyan-500/20 hover:bg-cyan-500/10">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-modern border-cyan-500/20 max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                        Bulk Upload {type === 'student' ? 'Students' : 'Faculty'}
                    </DialogTitle>
                    <DialogDescription>
                        Paste your CSV data below. Format: <span className="font-mono text-xs bg-slate-800 p-1 rounded">Name,Email,Department,{type === 'student' ? 'Batch' : 'Role'}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Textarea
                        placeholder={`John Doe,john@example.com,CS,${type === 'student' ? '2024' : 'Assistant Professor'}\nJane Smith,jane@example.com,IT,${type === 'student' ? '2025' : 'Professor'}`}
                        className="min-h-[200px] font-mono text-sm glass-modern border-cyan-500/20"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                    />

                    {result && (
                        <Alert variant={result.success ? "default" : "destructive"} className={`${result.success ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"}`}>
                            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                            <AlertDescription>
                                {result.message}
                                {result.details && (
                                    <div className="mt-2 text-xs opacity-80 max-h-20 overflow-y-auto">
                                        {result.details.map((d: string, i: number) => <div key={i}>{d}</div>)}
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpload}
                            disabled={loading || !csvData.trim()}
                            className="bg-gradient-to-r bg-gradient-primary"
                        >
                            {loading ? "Processing..." : "Upload & Process"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
