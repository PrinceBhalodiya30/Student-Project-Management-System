
"use client"

import { toast } from "sonner"
import { ComponentProps } from "react"

interface FormWithToastProps extends Omit<ComponentProps<"form">, "action"> {
    heading?: string
    description?: string
    action: (formData: FormData) => Promise<{ success: boolean; error?: string } | void>
    successMessage?: string
    children: React.ReactNode
}

export function FormWithToast({
    action,
    successMessage = "Action completed successfully",
    children,
    ...props
}: FormWithToastProps) {
    return (
        <form
            action={async (formData) => {
                try {
                    const result = await action(formData)
                    // If result is undefined (void) we assume success if no error thrown, 
                    // but better to check for success property if available.
                    if (result && 'success' in result && !result.success) {
                        toast.error(result.error || "Something went wrong")
                        return
                    }

                    toast.success(successMessage)

                } catch (error) {
                    toast.error("An unexpected error occurred")
                }
            }}
            {...props}
        >
            {children}
        </form>
    )
}
