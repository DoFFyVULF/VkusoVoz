"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Clock, Bike, ShoppingBag, MapPin, ImageOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useHours } from "@/lib/hooks/useHours"
import { nextOpenShortLabel, type DaySchedule } from "@/lib/restaurant-hours"

export interface RestaurantCardProps {
  slug: string
  name: string
  cuisine: string
  image: string
  rating: number
  reviewCount: number
  deliveryTimeMin: number
  deliveryTimeMax: number
  deliveryFee: number
  minOrderAmount: number
  distance: string
  tags?: string[]
  schedule: DaySchedule[]
}

export function RestaurantCard({
  slug,
  name,
  cuisine,
  image,
  rating,
  reviewCount,
  deliveryTimeMin,
  deliveryTimeMax,
  deliveryFee,
  minOrderAmount,
  distance,
  tags,
  schedule,
}: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false)
  const showFallback = !image || imageError
  const hours = useHours(schedule)
  const closedLabel =
    !hours.isOpen && hours.statusLabel.startsWith("Закрыто")
      ? hours.statusLabel.replace(/^Закрыто\s*[·\-—]?\s*/, "Закрыто · ")
      : "Закрыто"

  // Для кнопки внизу карточки: «Откроется в 12:00» / «Завтра в 10:00» / «Откроется через 45 мин».
  // Не дублируем overlay на фото — там остаётся полный статус "Закрыто · ...".
  const opensAtLabel = hours.nextOpensAt
    ? nextOpenShortLabel(new Date(hours.nextOpensAt), new Date())
    : undefined
  const ctaLabel = hours.isOpen
    ? "Перейти"
    : opensAtLabel
      ? `Откроется ${opensAtLabel}`
      : hours.statusLabel

  return (
    <Link
      href={`/restaurant/${slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
      aria-label={`${name}, ${cuisine}${!hours.isOpen ? `, ${hours.statusLabel}` : ""}`}
    >
      <Card className="group/restaurant relative overflow-hidden border border-border bg-surface shadow-soft transition-[transform,box-shadow,border-color] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[0_24px_48px_-18px_rgba(29,27,24,0.16)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {showFallback ? (
            <div
              role="img"
              aria-label="Фото недоступно"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/60 text-muted-foreground"
            >
              <ImageOff className="size-8" aria-hidden="true" />
              <span className="text-sm font-medium">Фото недоступно</span>
            </div>
          ) : (
            <Image
              src={image}
              alt={name}
              fill
              className={cn(
                "object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/restaurant:scale-105 motion-reduce:transition-none motion-reduce:group-hover/restaurant:scale-100",
                !hours.isOpen && "opacity-90"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          )}
          {tags && tags.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Badge key={t} variant="default" className="bg-surface/90 text-foreground backdrop-blur text-xs font-medium border-0 shadow-sm">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          {!hours.isOpen && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
              <span className="rounded-full bg-surface px-4 py-1.5 text-center text-sm font-semibold">
                {closedLabel}
              </span>
            </div>
          )}
          <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold shadow-sm">
            <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
            {deliveryTimeMin}–{deliveryTimeMax} мин
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-semibold leading-tight">{name}</h3>
              <p className="truncate text-sm text-muted-foreground">{cuisine}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/15 px-2 py-1 text-xs font-semibold text-warning border border-warning/20">
              <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
              {rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">· {reviewCount}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Bike className="size-3.5" aria-hidden="true" />
              {deliveryFee === 0 ? "Бесплатно" : `${deliveryFee} ₽`}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              от {minOrderAmount} ₽
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {distance}
            </span>
          </div>
          <span
            className={cn(
              "relative mt-1 inline-flex w-fit items-center justify-center overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold motion-reduce:transition-none",
              hours.isOpen
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {hours.isOpen && (
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-primary-hover transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] [transform-origin:right_center] group-hover/restaurant:[transform-origin:left_center] group-hover/restaurant:scale-x-100 scale-x-0 motion-reduce:group-hover/restaurant:scale-x-0"
              />
            )}
            <span
              className={cn(
                "relative",
                hours.isOpen && "transition-colors duration-300 group-hover/restaurant:text-primary-foreground"
              )}
            >
              {ctaLabel}
            </span>
          </span>
        </div>
      </Card>
    </Link>
  )
}

export function RestaurantCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
      </div>
    </Card>
  )
}
