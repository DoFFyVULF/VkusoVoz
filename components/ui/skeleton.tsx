import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted motion-reduce:animate-none relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent motion-reduce:before:hidden",
        className
      )}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  )
}
Skeleton.displayName = "Skeleton"

export { Skeleton }
