"use client"

import * as React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { RestaurantCard, RestaurantCardSkeleton } from "@/components/restaurant/restaurant-card"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { restaurantsMock, quickCategories } from "@/lib/mock-data"

type SortOption = "popular" | "rating" | "time" | "delivery"

export default function CatalogPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1280px] px-4 pt-4 text-sm text-muted-foreground">
          Загрузка…
        </div>
      }
    >
      <CatalogView />
    </React.Suspense>
  )
}

function CatalogView() {
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<string | null>(searchParams.get("cat"))

  // Синхронизируем категорию с параметром ?cat= из URL (например, при переходе
  // по быстрым категориям с главной). Ручное переключение чипов в каталоге не
  // меняет URL, поэтому этот эффект их не сбрасывает.
  React.useEffect(() => {
    setCategory(searchParams.get("cat"))
  }, [searchParams])

  const [sort, setSort] = React.useState<SortOption>("popular")
  const [openNow, setOpenNow] = React.useState(false)
  const [freeDelivery, setFreeDelivery] = React.useState(false)
  const [minRating, setMinRating] = React.useState<number | null>(null)
  const [maxTime, setMaxTime] = React.useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [error] = React.useState(false)
  const isLoading = false

  const filtered = React.useMemo(() => {
    let list = [...restaurantsMock]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q)))
    }
    if (category) {
      list = list.filter((r) => r.categories.includes(category) || r.cuisine.toLowerCase().includes(category.toLowerCase()))
    }
    if (openNow) list = list.filter((r) => r.isOpen)
    if (freeDelivery) list = list.filter((r) => r.deliveryFee === 0)
    if (minRating) list = list.filter((r) => r.rating >= minRating)
    if (maxTime) list = list.filter((r) => r.deliveryTimeMax <= maxTime)
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating)
    if (sort === "time") list.sort((a, b) => a.deliveryTimeMax - b.deliveryTimeMax)
    if (sort === "delivery") list.sort((a, b) => a.deliveryFee - b.deliveryFee)
    return list
  }, [search, category, openNow, freeDelivery, minRating, maxTime, sort])

  const hasActiveFilters = Boolean(category || openNow || freeDelivery || minRating || maxTime || search)

  const resetFilters = () => {
    setCategory(null)
    setOpenNow(false)
    setFreeDelivery(false)
    setMinRating(null)
    setMaxTime(null)
    setSearch("")
    setSort("popular")
  }

  const FiltersContent = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Категория</h3>
        <div className="flex flex-wrap gap-2">
          {quickCategories.map((c) => (
            <Chip key={c} selected={category === c} onClick={() => setCategory((prev) => (prev === c ? null : c))}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Рейтинг</h3>
        <div className="flex gap-2">
          {[4.5, 4.7, 4.8].map((r) => (
            <Chip key={r} selected={minRating === r} onClick={() => setMinRating((prev) => (prev === r ? null : r))}>
              от {r} ★
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Время доставки</h3>
        <div className="flex gap-2">
          {[30, 35, 45].map((t) => (
            <Chip key={t} selected={maxTime === t} onClick={() => setMaxTime((prev) => (prev === t ? null : t))}>
              до {t} мин
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Дополнительно</h3>
        <label className="flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2.5 text-sm">
          <input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} className="size-4 accent-primary" />
          Открыто сейчас
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2.5 text-sm">
          <input type="checkbox" checked={freeDelivery} onChange={(e) => setFreeDelivery(e.target.checked)} className="size-4 accent-primary" />
          Бесплатная доставка
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Минимальный заказ</h3>
        <p className="text-xs text-muted-foreground">Инфо из карточки — от 500 до 900 ₽</p>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={resetFilters} className="w-full">
          <X className="size-4" />
          Сбросить фильтры
        </Button>
      )}
    </div>
  )

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 pt-4 lg:gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight">Каталог ресторанов</h1>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по ресторанам и кухням"
                aria-label="Поиск"
                className="flex h-11 w-full rounded-xl border border-input bg-surface pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="hidden text-muted-foreground lg:inline">Сортировка:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  aria-label="Сортировка"
                  className="h-11 rounded-xl border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="popular">По популярности</option>
                  <option value="rating">По рейтингу</option>
                  <option value="time">По времени</option>
                  <option value="delivery">По доставке</option>
                </select>
              </label>
              <Button variant="outline" onClick={() => setDrawerOpen(true)} className="lg:hidden">
                <SlidersHorizontal className="size-4" />
                Фильтры
                {hasActiveFilters && <span className="ml-1 flex size-2 rounded-full bg-primary" aria-hidden="true" />}
              </Button>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {category}
                  <button aria-label="Убрать категорию" onClick={() => setCategory(null)} className="ml-1 rounded-full p-0.5 hover:bg-primary-foreground/20">
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                  “{search}”
                  <button aria-label="Очистить поиск" onClick={() => setSearch("")} className="ml-1">
                    <X className="size-3" />
                  </button>
                </span>
              )}
              <button onClick={resetFilters} className="text-xs font-medium text-primary hover:underline">
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-1 gap-6">
          <aside className="hidden w-[300px] shrink-0 flex-col gap-4 lg:flex">
            <div className="sticky top-[72px] rounded-2xl border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Фильтры</h2>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-xs font-medium text-primary hover:underline">
                    Сбросить
                  </button>
                )}
              </div>
              {FiltersContent}
            </div>
          </aside>

          <div className="flex flex-1 flex-col">
            {error ? (
              <ErrorState onRetry={() => window.location.reload()} />
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RestaurantCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="Пока пусто"
                description="По вашим фильтрам ничего не нашлось. Попробуйте изменить параметры."
                actionLabel="Сбросить фильтры"
                onAction={resetFilters}
              />
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">Найдено {filtered.length} ресторанов</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      slug={r.slug}
                      name={r.name}
                      cuisine={r.cuisine}
                      image={r.image}
                      rating={r.rating}
                      reviewCount={r.reviewCount}
                      deliveryTimeMin={r.deliveryTimeMin}
                      deliveryTimeMax={r.deliveryTimeMax}
                      deliveryFee={r.deliveryFee}
                      minOrderAmount={r.minOrderAmount}
                      distance={r.distance}
                      tags={r.tags}
                      schedule={r.schedule}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Фильтры" description="Настройте параметры поиска">
        {FiltersContent}
      </Drawer>
    </>
  )
}
