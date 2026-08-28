"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "default" | "success" | "info" | "warning" | "destructive"

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (t: Omit<Toast, "id">) => string
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}

const variantIcon: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />,
  info: <Info className="size-5 shrink-0 text-sky-500" aria-hidden="true" />,
  warning: <TriangleAlert className="size-5 shrink-0 text-warning" aria-hidden="true" />,
  destructive: <XCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />,
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-card p-4 shadow-lg motion-reduce:transition-none animate-in slide-in-from-top-2",
        toast.variant === "destructive" && "border-destructive/20 bg-destructive/5",
        toast.variant === "success" && "border-success/20 bg-success/5"
      )}
    >
      {toast.variant && variantIcon[toast.variant]}
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold leading-none">{toast.title}</p>
        {toast.description && <p className="text-xs text-muted-foreground">{toast.description}</p>}
      </div>
      <button
        type="button"
        aria-label="Закрыть уведомление"
        onClick={onDismiss}
        className="inline-flex size-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2, 9)
      const entry: Toast = { id, duration: 4000, variant: "default", ...t }
      setToasts((prev) => [...prev, entry])
      if (entry.duration && entry.duration > 0) {
        setTimeout(() => dismiss(id), entry.duration)
      }
      return id
    },
    [dismiss]
  )

  const value = React.useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            aria-relevant="additions text"
            className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}
