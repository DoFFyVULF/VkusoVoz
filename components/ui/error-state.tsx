"use client"

import * as React from "react"
import { TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  retryLabel?: string
  onRetry?: () => void
}

function ErrorState({
  className,
  title = "Что-то пошло не так",
  description = "Не удалось загрузить данные. Попробуйте ещё раз.",
  retryLabel = "Повторить",
  onRetry,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-8 py-12 text-center",
        className
      )}
      {...props}
    >
      <div
        className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
        aria-hidden="true"
      >
        <TriangleAlert className="size-8" />
      </div>
      <div className="flex max-w-sm flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
ErrorState.displayName = "ErrorState"

export { ErrorState }
