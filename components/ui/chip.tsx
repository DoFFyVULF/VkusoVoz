"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none min-h-9 px-4 motion-reduce:transition-none",
  {
    variants: {
      selected: {
        true: "bg-primary text-primary-foreground border-transparent shadow-sm hover:bg-primary-hover",
        false: "bg-card text-foreground border-input hover:bg-muted hover:text-foreground",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  count?: number
  selected?: boolean
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected = false, count, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={selected}
        data-state={selected ? "on" : "off"}
        className={cn(chipVariants({ selected }), className)}
        {...props}
      >
        {children}
        {typeof count === "number" && (
          <span
            className={cn(
              "inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none",
              selected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
            aria-label={`Количество: ${count}`}
          >
            {count}
          </span>
        )}
      </button>
    )
  }
)
Chip.displayName = "Chip"

export { Chip, chipVariants }
