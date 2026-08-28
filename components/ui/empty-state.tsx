import * as React from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

function EmptyState({
  className,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-card px-8 py-12 text-center",
        className
      )}
      {...props}
    >
      <div
        className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        {icon ?? <Inbox className="size-8" />}
      </div>
      <div className="flex max-w-sm flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
EmptyState.displayName = "EmptyState"

export { EmptyState }
