"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, Bike, MapPin, ArrowLeft, ChevronRight } from "lucide-react"
import { DishCard } from "@/components/dish/dish-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { demoRestaurant, restaurantsMock } from "@/lib/mock-data"
import { useParams } from "next/navigation"
import { useCartStore, formatPrice } from "@/lib/store/cart"
import { useHours } from "@/lib/hooks/useHours"
import type { DaySchedule } from "@/lib/restaurant-hours"
import { FavoriteShareButtons } from "@/components/restaurant/favorite-share-buttons"

export default function RestaurantPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? demoRestaurant.slug

  const restaurant = React.useMemo(() => {
    const found = restaurantsMock.find((r) => r.slug === slug)
    if (found) {
      return {
        slug: found.slug,
        name: found.name,
        cuisine: found.cuisine,
        rating: found.rating,
        reviewCount: found.reviewCount,
        deliveryTimeMin: found.deliveryTimeMin,
        deliveryTimeMax: found.deliveryTimeMax,
        deliveryFee: found.deliveryFee,
        minOrderAmount: found.minOrderAmount,
        address: demoRestaurant.address,
        coverImage: found.coverImage,
        image: found.image,
        description: demoRestaurant.description,
        schedule: found.schedule,
        categories: demoRestaurant.categories,
        menu: demoRestaurant.menu,
        reviews: demoRestaurant.reviews,
      }
    }
    return demoRestaurant
  }, [slug])

  const hours = useHours(restaurant.schedule as DaySchedule[])

  const [activeCategory, setActiveCategory] = React.useState(restaurant.categories[0]?.slug ?? "pizza")
  const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({})

  const cartItems = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const getOptionsKey = useCartStore((s) => s.getOptionsKey)

  // Filter to this restaurant's items only — cart may contain items from other restaurants.
  const visibleItems = React.useMemo(
    () => cartItems.filter((it) => it.restaurantId === restaurant.slug),
    [cartItems, restaurant.slug]
  )
  const cartSubtotal = React.useMemo(
    () =>
      visibleItems.reduce((sum, it) => {
        const delta = it.options.reduce((s, o) => s + o.priceDelta, 0)
        return sum + (it.price + delta) * it.quantity
      }, 0),
    [visibleItems]
  )
  const cartTotalQuantity = React.useMemo(
    () => visibleItems.reduce((s, i) => s + i.quantity, 0),
    [visibleItems]
  )

  const scrollToCategory = (catSlug: string) => {
    setActiveCategory(catSlug)
    sectionRefs.current[catSlug]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Категории без блюд — серые в sticky-навигации; клик по ним трясёт кнопку.
  const emptyCategoryIds = React.useMemo(() => {
    const filled = new Set(restaurant.menu.map((s) => s.categoryId))
    return new Set(
      restaurant.categories.filter((c) => !filled.has(c.id)).map((c) => c.id)
    )
  }, [restaurant.categories, restaurant.menu])
  const emptySlugs = React.useMemo(
    () => new Set(restaurant.categories.filter((c) => emptyCategoryIds.has(c.id)).map((c) => c.slug)),
    [restaurant.categories, emptyCategoryIds]
  )

  const [shakingSlug, setShakingSlug] = React.useState<string | null>(null)
  const shakeTimer = React.useRef<number | null>(null)
  const handleCategoryClick = (catSlug: string, isEmpty: boolean) => {
    if (isEmpty) {
      setShakingSlug(catSlug)
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current)
      shakeTimer.current = window.setTimeout(() => setShakingSlug(null), 600)
      return
    }
    scrollToCategory(catSlug)
  }
  React.useEffect(() => {
    return () => {
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current)
    }
  }, [])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("id")
            if (id) setActiveCategory(id)
          }
        })
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>

      <div className="relative h-[220px] w-full overflow-hidden lg:h-[340px]">
        <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover blur-xs" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <Link
          href="/catalog"
          aria-label="Назад к каталогу"
          className="absolute left-4 top-4 inline-flex size-11 items-center justify-center rounded-xl bg-surface/90 backdrop-blur hover:bg-surface lg:left-6"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
          <div className="mx-auto flex max-w-[1280px] items-end justify-between gap-4">
            <div className="flex gap-4">
              <div className="hidden size-20  overflow-hidden rounded-2xl border-2 border-white bg-surface shadow lg:block">
                <Image src={restaurant.image} alt="" width={80} height={80} className="size-full  object-cover" />
              </div>
              <div className="flex flex-col gap-1 text-white">
                <h1 className="font-heading text-2xl text-white font-bold leading-none drop-shadow lg:text-3xl">{restaurant.name}</h1>
                <p className="text-sm text-white/90">{restaurant.cuisine}</p>
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-foreground">
                    <Star className="size-3.5 fill-warning text-warning" /> {restaurant.rating.toFixed(1)} · {restaurant.reviewCount} отзывов
                  </span>
                  <span className="hidden items-center gap-1 lg:inline-flex">
                    <Clock className="size-3.5" /> {restaurant.deliveryTimeMin}–{restaurant.deliveryTimeMax} мин
                  </span>
                </span>
              </div>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <FavoriteShareButtons
                restaurantSlug={restaurant.slug}
                restaurantName={restaurant.name}
                restaurantDescription={`${restaurant.cuisine} · ★ ${restaurant.rating.toFixed(1)}`}
                className="flex"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-4">
        <Card className="mt-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                hours.isOpen
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              )}
              aria-live="polite"
            >
              <span
                className={cn(
                  "inline-block size-1.5 rounded-full",
                  hours.isOpen ? "bg-success" : "bg-destructive"
                )}
                aria-hidden="true"
              />
              {hours.statusLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="size-4" /> {restaurant.deliveryTimeMin}–{restaurant.deliveryTimeMax} мин
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Bike className="size-4" /> {restaurant.deliveryFee === 0 ? "Бесплатно" : `${restaurant.deliveryFee} ₽`}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-4" /> {restaurant.address}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted" className="rounded-full">от {restaurant.minOrderAmount} ₽</Badge>
            <Link href="#menu" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Меню <ChevronRight className="size-4" />
            </Link>
          </div>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground lg:max-w-[720px]">{restaurant.description}</p>
      </div>

      <div className="sticky top-16 z-30 mt-4 border-y bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto flex max-w-[1280px] gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
          {restaurant.categories.map((cat) => {
            const isEmpty = emptySlugs.has(cat.slug)
            const isShaking = shakingSlug === cat.slug
            const isActive = activeCategory === cat.slug
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat.slug, isEmpty)}
                aria-current={isActive ? "true" : undefined}
                aria-disabled={isEmpty || undefined}
                title={isEmpty ? "В этой категории пока ничего нет" : undefined}
                aria-label={
                  isEmpty
                    ? `${cat.name} — в этой категории пока ничего нет`
                    : cat.name
                }
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap min-h-9 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isShaking && "animate-shake border-destructive bg-destructive/10 text-destructive",
                  !isShaking && isEmpty && "border-border bg-muted text-muted-foreground hover:bg-muted",
                  !isShaking && !isEmpty && isActive && "border-primary bg-primary text-primary-foreground",
                  !isShaking && !isEmpty && !isActive && "border-input bg-surface text-foreground hover:bg-muted"
                )}
              >
                {cat.name}
                {isEmpty && (
                  <span className="ml-1.5 text-xs font-normal opacity-70" aria-hidden="true">
                    0
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div id="menu" className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 pt-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-8">
          {restaurant.menu.map((section) => {
            const cat = restaurant.categories.find((c) => c.id === section.categoryId)
            if (!cat) return null
            return (
              <section
                key={cat.slug}
                id={cat.slug}
                ref={(el) => {
                  sectionRefs.current[cat.slug] = el
                }}
                className="scroll-mt-28"
                aria-labelledby={`cat-${cat.slug}`}
              >
                <h2 id={`cat-${cat.slug}`} className="mb-3 text-lg font-semibold">
                  {cat.name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">{section.dishes.length}</span>
                </h2>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {section.dishes.map((d) => (
                    <DishCard
                      key={d.id}
                      id={d.id}
                      name={d.name}
                      description={d.description}
                      image={d.image}
                      price={d.price}
                      weight={d.weight}
                      badges={d.badges as unknown as ("хит" | "новое")[]}
                      isAvailable={d.isAvailable}
                      restaurantId={restaurant.slug}
                      restaurantName={restaurant.name}
                      restaurantSlug={restaurant.slug}
                    />
                  ))}
                </div>
              </section>
            )
          })}

          {/* Заглушки для пустых категорий — якорь для серых кнопок в sticky-навигации. */}
          {restaurant.categories
            .filter((c) => emptyCategoryIds.has(c.id))
            .map((cat) => (
              <section
                key={cat.slug}
                id={cat.slug}
                ref={(el) => {
                  sectionRefs.current[cat.slug] = el
                }}
                className="scroll-mt-28"
                aria-labelledby={`cat-${cat.slug}`}
              >
                <h2 id={`cat-${cat.slug}`} className="mb-3 text-lg font-semibold">
                  {cat.name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">0</span>
                </h2>
                <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center">
                  <span className="text-sm font-semibold text-foreground">В этой категории пока ничего нет</span>
                  <span className="text-xs text-muted-foreground">Загляните позже — меню обновляется</span>
                </div>
              </section>
            ))}

          <section aria-labelledby="reviews-title" className="flex flex-col gap-4 rounded-2xl border bg-surface p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <h2 id="reviews-title" className="text-lg font-semibold">Отзывы</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-warm px-3 py-1 text-sm font-semibold">
                <Star className="size-4 fill-warning text-warning" /> {restaurant.rating.toFixed(1)} · {restaurant.reviewCount}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {restaurant.reviews.map((r) => (
                <div key={r.id} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{r.author}</span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <Rating value={r.rating} readonly size="sm" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-fit">Все отзывы</Button>
          </section>
        </div>

        <aside className="hidden w-[320px] shrink-0 lg:block">
          <div className="sticky top-28 flex flex-col gap-4 rounded-2xl border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Ваш заказ</h3>
              {visibleItems.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {cartTotalQuantity} шт
                </span>
              )}
            </div>

            {cartItems.length > visibleItems.length && visibleItems.length > 0 && (
              <div className="rounded-xl border bg-warm px-3 py-2 text-xs text-muted-foreground">
                В общей корзине ещё {cartItems.length - visibleItems.length}{" "}
                {cartItems.length - visibleItems.length === 1
                  ? "блюдо"
                  : cartItems.length - visibleItems.length < 5
                    ? "блюда"
                    : "блюд"}{" "}
                из других ресторанов.
              </div>
            )}

            {visibleItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока пусто — добавьте блюда из меню</p>
            ) : (
              <ul className="flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-1">
                {visibleItems.map((it) => {
                  const optionsDelta = it.options.reduce((s, o) => s + o.priceDelta, 0)
                  const lineTotal = (it.price + optionsDelta) * it.quantity
                  const key = getOptionsKey(it.options)
                  return (
                    <li key={`${it.dishId}-${key}`} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-snug">{it.name}</span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(lineTotal)}</span>
                      </div>
                      {it.options.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {it.options.map((o) => o.name).join(", ")}
                        </p>
                      )}
                      <div className="mt-1 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 rounded-lg border">
                          <button
                            type="button"
                            aria-label="Убрать одну"
                            onClick={() => updateQuantity(it.dishId, key, it.quantity - 1)}
                            className="inline-flex size-7 items-center justify-center text-sm hover:bg-muted"
                          >
                            −
                          </button>
                          <span className="min-w-5 text-center text-xs font-semibold tabular-nums">{it.quantity}</span>
                          <button
                            type="button"
                            aria-label="Добавить ещё"
                            onClick={() => updateQuantity(it.dishId, key, it.quantity + 1)}
                            className="inline-flex size-7 items-center justify-center text-sm hover:bg-muted"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(it.dishId, key)}
                          className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                        >
                          Удалить
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="rounded-xl bg-warm p-3 text-xs leading-relaxed text-muted-foreground border">
              Доставка {restaurant.deliveryFee === 0 ? "бесплатно" : `${restaurant.deliveryFee} ₽`} · минимум {restaurant.minOrderAmount} ₽ · {restaurant.deliveryTimeMin}–{restaurant.deliveryTimeMax} мин
            </div>

            {visibleItems.length === 0 ? (
              <>
                <Button disabled className="w-full">
                  Корзина пуста
                </Button>
                <Link href="/catalog" className="text-center text-sm font-medium text-primary hover:underline">
                  Вернуться в каталог
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-semibold">Итого</span>
                  <span className="text-base font-bold tabular-nums">{formatPrice(cartSubtotal)}</span>
                </div>
                {cartSubtotal < restaurant.minOrderAmount && (
                  <p className="text-xs text-muted-foreground">
                    До минимального заказа: {formatPrice(restaurant.minOrderAmount - cartSubtotal)}
                  </p>
                )}
                <Link
                  href="/cart"
                  className={cn(buttonVariants({ variant: "primary", size: "default" }), "w-full")}
                >
                  Перейти в корзину
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}
