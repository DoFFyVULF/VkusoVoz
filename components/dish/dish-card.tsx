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
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const getOptionsKey = useCartStore((s) => s.getOptionsKey)
  const items = useCartStore((s) => s.items)

  const restaurantKey = restaurantId ?? restaurantSlug ?? "unknown"

  // Опции у DishCard всегда пустые (base), поэтому ключ — "base"
  const qty = React.useMemo(() => {
    const baseKey = "base"
    // Учитываем restaurantId, чтобы не смешивать одинаковые dishId из разных ресторанов
    const found =
      items.find((it) => it.dishId === id && it.restaurantId === restaurantKey && getOptionsKey(it.options) === baseKey) ??
      items.find((it) => it.dishId === id && getOptionsKey(it.options) === baseKey)
    return found?.quantity ?? 0
  }, [items, id, getOptionsKey, restaurantKey])

  const handleAdd = () => {
    if (!isAvailable) return
    if (onAdd) {
      onAdd(id)
      // Если onAdd используется, он сам отвечает за корзину (например, открывает модалку).
      // Для простых карточек без модалки — добавляем напрямую.
      // Чтобы qty не рассинхронился, если onAdd не добавил в стор, мы не инкрементим локально.
      // Поэтому если onAdd есть — не трогаем стор, но qty всё равно считается из стора.
      return
    }
    addItem({
      dishId: id,
      name,
      price,
      image,
      quantity: 1,
      options: [],
      restaurantId: restaurantKey,
      restaurantName: restaurantName ?? undefined,
    })
  }

  const handleIncrement = () => {
    if (onAdd) {
      onAdd(id)
      return
    }
    addItem({
      dishId: id,
      name,
      price,
      image,
      quantity: 1,
      options: [],
      restaurantId: restaurantKey,
      restaurantName: restaurantName ?? undefined,
    })
  }

  const handleDecrement = () => {
    if (qty <= 1) {
      removeItem(id, "base")
    } else {
      updateQuantity(id, "base", qty - 1)
    }
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
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-3">
        <h3 className="line-clamp-2 min-w-0 text-[13px] font-semibold leading-tight sm:text-sm">{name}</h3>
        {description && (
          <p className="line-clamp-2 min-w-0 text-[11px] leading-[1.35] text-muted-foreground sm:text-xs sm:leading-relaxed">{description}</p>
        )}
        <div className="mt-auto flex min-w-0 items-end justify-between gap-1.5 pt-1 sm:gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-baseline gap-x-1 gap-y-0 sm:gap-x-1.5">
              <span className="whitespace-nowrap text-[15px] font-bold leading-none sm:text-[16px]">{price}&nbsp;₽</span>
              {oldPrice && <span className="whitespace-nowrap text-[11px] font-normal text-muted-foreground line-through sm:text-xs">{oldPrice}&nbsp;₽</span>}
            </span>
            {weight && <span className="whitespace-nowrap text-[11px] text-muted-foreground sm:text-xs">{weight}&nbsp;г</span>}
          </div>
          {isAvailable ? (
            qty === 0 ? (
              <Button
                size="icon"
                aria-label={`Добавить ${name} в корзину`}
                onClick={handleAdd}
                className="size-8 shrink-0 rounded-xl sm:size-9"
              >
                <Plus className="size-3.5 sm:size-4" />
              </Button>
            ) : (
              <span className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-xl border bg-card p-0.5 sm:h-9 sm:p-1">
                <button
                  type="button"
                  aria-label={`Убрать одну порцию ${name}`}
                  onClick={handleDecrement}
                  className="inline-flex size-6 items-center justify-center rounded-lg bg-muted text-foreground transition-colors duration-150 hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:size-7"
                >
                  <Minus className="size-3 sm:size-3.5" />
                </button>
                <span
                  className="min-w-6 px-1 text-center text-[13px] font-bold tabular-nums sm:min-w-7 sm:text-sm"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label={`Добавить ещё одну порцию ${name}`}
                  onClick={handleIncrement}
                  className="inline-flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:size-7"
                >
                  <Plus className="size-3 sm:size-3.5" />
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
