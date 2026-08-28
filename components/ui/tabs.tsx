"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs compound components must be inside <Tabs>")
  return ctx
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
  defaultValue?: string
}

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex h-11 items-center justify-start gap-1 rounded-xl bg-muted p-1 overflow-x-auto scrollbar-none",
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selected, onValueChange } = useTabsContext()
    const isActive = selected === value
    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        aria-selected={isActive}
        tabIndex={isActive ? 0 : -1}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => onValueChange(value)}
        onKeyDown={(e) => {
          const triggers = Array.from(
            e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
          )
          const idx = triggers.indexOf(e.currentTarget)
          if (e.key === "ArrowRight") {
            e.preventDefault()
            const next = triggers[(idx + 1) % triggers.length]
            next?.focus()
            next?.click()
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault()
            const prev = triggers[(idx - 1 + triggers.length) % triggers.length]
            prev?.focus()
            prev?.click()
          }
          if (e.key === "Home") {
            e.preventDefault()
            triggers[0]?.focus()
            triggers[0]?.click()
          }
          if (e.key === "End") {
            e.preventDefault()
            triggers[triggers.length - 1]?.focus()
            triggers[triggers.length - 1]?.click()
          }
        }}
        className={cn(
          "inline-flex min-h-9 min-w-11 items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
          isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selected } = useTabsContext()
    const isActive = selected === value
    if (!isActive) return null
    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={cn(
          "rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
