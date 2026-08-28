"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number
  max?: number
  readonly?: boolean
  size?: "sm" | "default" | "lg"
  onChange?: (value: number) => void
}

const sizeMap = {
  sm: "size-4",
  default: "size-5",
  lg: "size-6",
} as const

function Rating({
  className,
  value,
  max = 5,
  readonly = false,
  size = "default",
  onChange,
  ...props
}: RatingProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  const displayValue = hover ?? value

  return (
    <div
      role={readonly ? "img" : "radiogroup"}
      aria-label={readonly ? `Рейтинг ${value} из ${max}` : "Выберите рейтинг"}
      className={cn("inline-flex items-center gap-0.5", className)}
      {...props}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1
        const filled = starValue <= displayValue
        const isActive = starValue <= value

        if (readonly) {
          return (
            <Star
              key={i}
              aria-hidden="true"
              className={cn(
                sizeMap[size],
                filled ? "fill-warning text-warning" : "fill-transparent text-muted-foreground/30"
              )}
            />
          )
        }

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${starValue} из ${max}`}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(starValue)}
            onBlur={() => setHover(null)}
            onClick={() => onChange?.(starValue)}
            className="rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none transition-colors min-h-11 min-w-11 flex items-center justify-center -m-1.5 first:ml-0"
          >
            <Star
              aria-hidden="true"
              className={cn(
                sizeMap[size],
                "transition-colors motion-reduce:transition-none",
                filled ? "fill-warning text-warning" : "fill-transparent text-muted-foreground/30 hover:text-muted-foreground/50"
              )}
            />
          </button>
        )
      })}
      <span className="sr-only">
        {value} из {max}
      </span>
    </div>
  )
}
Rating.displayName = "Rating"

export { Rating }
