import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold leading-none border motion-reduce:transition-none",
  {
    variants: {
      status: {
        pending: "bg-warning/10 text-warning border-warning/20",
        confirmed: "bg-sky-500/10 text-sky-600 border-sky-500/20",
        preparing: "bg-amber-500/10 text-amber-700 border-amber-500/20",
        delivering: "bg-violet-500/10 text-violet-600 border-violet-500/20",
        delivered: "bg-success/10 text-success border-success/20",
        cancelled: "bg-destructive/10 text-destructive border-destructive/20",
        paid: "bg-success/10 text-success border-success/20",
        unpaid: "bg-muted text-muted-foreground border-transparent",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

const dotColors: Record<string, string> = {
  pending: "bg-warning",
  confirmed: "bg-sky-500",
  preparing: "bg-amber-500",
  delivering: "bg-violet-500",
  delivered: "bg-success",
  cancelled: "bg-destructive",
  paid: "bg-success",
  unpaid: "bg-muted-foreground",
}

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {
  status: NonNullable<VariantProps<typeof statusPillVariants>["status"]>
  label?: string
}

function StatusPill({ className, status, label, children, ...props }: StatusPillProps) {
  return (
    <span className={cn(statusPillVariants({ status }), className)} {...props}>
      <span
        className={cn("size-1.5 shrink-0 rounded-full", dotColors[status as string] ?? "bg-current")}
        aria-hidden="true"
      />
      {label ?? children ?? status}
    </span>
  )
}
StatusPill.displayName = "StatusPill"

export { StatusPill, statusPillVariants }
