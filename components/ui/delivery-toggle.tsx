"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useDeliveryStore } from "@/lib/store/delivery"

type DeliveryToggleProps = {
  size?: "sm" | "default"
  className?: string
}

export function DeliveryToggle({ size = "default", className }: DeliveryToggleProps) {
  const mode = useDeliveryStore((s) => s.mode)
  const setMode = useDeliveryStore((s) => s.setMode)

  const deliveryRef = React.useRef<HTMLButtonElement>(null)
  const pickupRef = React.useRef<HTMLButtonElement>(null)
  const [indicator, setIndicator] = React.useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  })

  const isSm = size === "sm"

  const measure = React.useCallback(() => {
    const btn = mode === "delivery" ? deliveryRef.current : pickupRef.current
    if (!btn) return
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true })
  }, [mode])

  React.useLayoutEffect(() => {
    measure()
  }, [measure])

  React.useEffect(() => {
    const onResize = () => measure()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [measure])

  const baseBtn = cn(
    "relative z-10 inline-flex items-center justify-center rounded-full font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 motion-reduce:transition-none select-none",
    isSm
      ? "h-7 min-h-7 px-2.5 text-[11px] sm:px-3 sm:text-xs"
      : "h-7 min-h-7 px-3 text-xs sm:px-3.5 sm:text-[13px]",
  )

  return (
    <div
      role="group"
      aria-label="Способ получения"
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full bg-muted p-0.5 border border-border",
        className
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 h-[calc(100%-4px)] rounded-full bg-primary shadow-sm will-change-[transform,width]",
          indicator.ready
            ? "transition-[transform,width] duration-200 ease-out motion-reduce:transition-none"
            : "transition-none opacity-0"
        )}
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: `${indicator.width}px`,
        }}
      />
      <button
        ref={deliveryRef}
        type="button"
        aria-pressed={mode === "delivery"}
        onClick={() => setMode("delivery")}
        className={cn(
          baseBtn,
          mode === "delivery" ? "text-primary-foreground" : "text-foreground hover:text-foreground"
        )}
      >
        Доставка
      </button>
      <button
        ref={pickupRef}
        type="button"
        aria-pressed={mode === "pickup"}
        onClick={() => setMode("pickup")}
        className={cn(
          baseBtn,
          mode === "pickup" ? "text-primary-foreground" : "text-foreground hover:text-foreground"
        )}
      >
        Самовывоз
      </button>
    </div>
  )
}
