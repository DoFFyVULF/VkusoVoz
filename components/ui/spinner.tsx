import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
}

const sizeClasses = {
  sm: "size-4",
  default: "size-6",
  lg: "size-8",
} as const

function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Загрузка"
      aria-live="polite"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-muted-foreground motion-reduce:animate-none", sizeClasses[size])} aria-hidden="true" />
      <span className="sr-only">Загрузка...</span>
    </div>
  )
}
Spinner.displayName = "Spinner"

export { Spinner }
