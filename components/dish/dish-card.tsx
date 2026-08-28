"use client"

import * as React from "react"
import Image from "next/image"
import { Plus, Minus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/store/cart"

export interface DishCardProps {
  id: string
  name: string
  description?: string
  image: string
  price: number
  oldPrice?: number
  weight?: number
  badges?: ("хит" | "новое")[]
  isAvailable?: boolean
  onAdd?: (id: string) => void
  restaurantId?: string
  restaurantSlug?: string
  restaurantName?: string
}

export function DishCard({
  id,
  name,
  description,
  image,
  price,
  oldPrice,
  weight,
  badges,
  isAvailable = true,
  onAdd,
  restaurantId,
  restaurantSlug,
  restaurantName,
}: DishCardProps) {
  const [qty, setQty] = React.useState(0)
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    if (!isAvailable) return
    setQty((q) => q + 1)
    if (onAdd) {
      onAdd(id)
    } else {
      addItem({
        dishId: id,
        name,
        price,
        image,
        quantity: 1,
        options: [],
        restaurantId: restaurantId ?? restaurantSlug ?? "unknown",
        restaurantName: restaurantName ?? undefined,
      })
    }
  }

  const handleDecrement = () => {
    setQty((q) => Math.max(0, q - 1))
  }

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden bg-surface transition-[border-color,box-shadow] duration-150 hover:border-border hover:shadow-sm motion-reduce:transition-none",
        !isAvailable && "opacity-60"
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {badges && badges.length > 0 && (
          <div className="absolute left-2 top-2 flex gap-1.5">
            {badges.map((b) => (
              <Badge
                key={b}
                variant={b === "хит" ? "warning" : "success"}
                className="text-[11px] capitalize px-2 py-0.5"
              >
                {b}
              </Badge>
            ))}
          </div>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">Нет в наличии</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{name}</h3>
        {description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-col">
            <span className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-bold leading-none">{price} ₽</span>
              {oldPrice && <span className="text-xs font-normal text-muted-foreground line-through">{oldPrice} ₽</span>}
            </span>
            {weight && <span className="text-xs text-muted-foreground">{weight} г</span>}
          </div>
          {isAvailable ? (
            qty === 0 ? (
              <Button
                size="icon"
                aria-label={`Добавить ${name}`}
                onClick={handleAdd}
                className="size-9 rounded-xl shrink-0"
              >
                <Plus className="size-4" />
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-xl border bg-card p-1">
                <button
                  type="button"
                  aria-label="Уменьшить"
                  onClick={handleDecrement}
                  className="inline-flex size-8 items-center justify-center rounded-lg bg-muted hover:bg-border transition-colors duration-150 motion-reduce:transition-none"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="Увеличить"
                  onClick={handleAdd}
                  className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors duration-150 motion-reduce:transition-none"
                >
                  <Plus className="size-3.5" />
                </button>
              </span>
            )
          ) : (
            <Button size="sm" disabled variant="outline" className="shrink-0 rounded-xl">
              Нет
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export function DishCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    </Card>
  )
}
