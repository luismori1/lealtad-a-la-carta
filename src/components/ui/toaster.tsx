"use client"

// Simplified version of the Toaster component
import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts } = useToast()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`rounded-md p-4 shadow-md ${
            toast.variant === "destructive"
              ? "bg-destructive text-destructive-foreground"
              : "bg-background text-foreground"
          }`}
        >
          {toast.title && <div className="font-medium">{toast.title}</div>}
          {toast.description && <div className="text-sm">{toast.description}</div>}
        </div>
      ))}
    </div>
  )
}
