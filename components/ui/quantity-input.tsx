"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface QuantityInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  ariaLabel?: string
}

function QuantityInput({
  className,
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  ariaLabel = "Количество",
  ...props
}: QuantityInputProps) {
  const decrement = () => {
    if (disabled) return
    onChange(Math.max(min, value - step))
  }
  const increment = () => {
    if (disabled) return
    onChange(Math.min(max, value + step))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault()
      increment()
    }
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault()
      decrement()
    }
  }

  const canDecrement = !disabled && value > min
  const canIncrement = !disabled && value < max

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border bg-card p-1",
        disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <button
        type="button"
        aria-label="Уменьшить количество"
        disabled={!canDecrement}
        onClick={decrement}
        className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg bg-muted text-foreground hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none transition-colors duration-150"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel}
        tabIndex={0}
        className="inline-flex min-w-11 justify-center px-3 text-sm font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Увеличить количество"
        disabled={!canIncrement}
        onClick={increment}
        className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none transition-colors duration-150"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
QuantityInput.displayName = "QuantityInput"

export { QuantityInput }
