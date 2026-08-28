"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

function Drawer({ open, onOpenChange, title, description, children, className }: DrawerProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const descId = React.useId()
  const prevActiveRef = React.useRef<HTMLElement | null>(null)

  const [rendered, setRendered] = React.useState(open)
  const [animateIn, setAnimateIn] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setRendered(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)))
    } else if (rendered) {
      setAnimateIn(false)
      const t = setTimeout(() => setRendered(false), 200)
      return () => clearTimeout(t)
    }
  }, [open, rendered])

  React.useEffect(() => {
    if (!rendered || !open) return
    prevActiveRef.current = document.activeElement as HTMLElement | null
    contentRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
      if (e.key === "Tab" && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
      prevActiveRef.current?.focus()
    }
  }, [open, rendered, onOpenChange])

  if (!rendered) return null

  const node = (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none",
          animateIn ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[75vh] w-full flex-col rounded-t-2xl bg-card text-card-foreground shadow-xl focus:outline-none sm:max-w-[480px] sm:rounded-2xl will-change-transform motion-reduce:transition-none",
          "transition-all duration-200 ease-out",
          animateIn
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full opacity-0 sm:translate-y-2 sm:scale-[0.98]",
          className
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted sm:hidden" aria-hidden="true" />
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
            <div className="flex flex-col gap-1">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold leading-none">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
        {!title && (
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-xl bg-muted hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:top-3"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
        <div className="overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  )

  if (typeof document === "undefined") return null
  return createPortal(node, document.body)
}
Drawer.displayName = "Drawer"

export { Drawer }
