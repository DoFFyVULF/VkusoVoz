"use client"

import * as React from "react"
import Link from "next/link"
import type { Route } from "next"
import { useRouter } from "next/navigation"
import { Search, Store, UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"
import { restaurantsMock, dishesMock, quickCategories } from "@/lib/mock-data"

type Props = {
  placeholder?: string
  className?: string
}

function sanitize(v: string): string {
  return v.slice(0, 40).replace(/[<>]/g, "")
}

function highlight(text: string, query: string) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + query.length)
  const after = text.slice(idx + query.length)
  return (
    <>
      {before}
      <mark className="bg-warm text-primary px-0.5 rounded">{match}</mark>
      {after}
    </>
  )
}

type FlatItem = { id: string; href: string }

export function SearchDropdown({ placeholder = "Найти блюдо, ресторан или кухню — например, «пицца»", className }: Props) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listId = React.useId()

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(sanitize(query).trim()), 200)
    return () => clearTimeout(t)
  }, [query])

  const sanitizedDebounced = debounced.toLowerCase()
  const hasMinChars = sanitizedDebounced.length >= 2

  const restaurants = React.useMemo(() => {
    if (!hasMinChars) return []
    return restaurantsMock
      .filter((r) => r.name.toLowerCase().includes(sanitizedDebounced) || r.cuisine.toLowerCase().includes(sanitizedDebounced) || r.tags.some((t) => t.toLowerCase().includes(sanitizedDebounced)))
      .slice(0, 4)
  }, [sanitizedDebounced, hasMinChars])

  const dishes = React.useMemo(() => {
    if (!hasMinChars) return []
    return dishesMock
      .filter((d) => d.name.toLowerCase().includes(sanitizedDebounced) || d.description.toLowerCase().includes(sanitizedDebounced))
      .slice(0, 4)
  }, [sanitizedDebounced, hasMinChars])

  const categories = React.useMemo(() => {
    if (!hasMinChars) return []
    return quickCategories.filter((c) => c.toLowerCase().includes(sanitizedDebounced)).slice(0, 4) as string[]
  }, [sanitizedDebounced, hasMinChars])

  const flat: FlatItem[] = React.useMemo(() => {
    const arr: FlatItem[] = []
    restaurants.forEach((r) => arr.push({ id: `r-${r.id}`, href: `/restaurant/${r.slug}` }))
    dishes.forEach((d) => arr.push({ id: `d-${d.id}`, href: `/restaurant/${d.restaurantSlug}` }))
    categories.forEach((c) => arr.push({ id: `c-${c}`, href: `/catalog` }))
    if (!hasMinChars || (restaurants.length === 0 && dishes.length === 0 && categories.length === 0)) {
      return arr
    }
    return arr
  }, [restaurants, dishes, categories, hasMinChars])

  const showDropdown = focused && isOpen

  React.useEffect(() => {
    if (focused) setIsOpen(true)
  }, [focused])

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setFocused(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  React.useEffect(() => {
    setActiveIndex(-1)
  }, [sanitizedDebounced])

  function close() {
    setIsOpen(false)
    setFocused(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return
    if (!hasMinChars) {
      if (e.key === "Escape") {
        e.preventDefault()
        close()
        inputRef.current?.blur()
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (flat.length === 0) return
      setActiveIndex((prev) => (prev + 1) % flat.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (flat.length === 0) return
      setActiveIndex((prev) => (prev - 1 + flat.length) % flat.length)
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && flat[activeIndex]) {
        e.preventDefault()
        const href = flat[activeIndex].href as Route
        close()
        router.push(href)
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      close()
      inputRef.current?.blur()
    }
  }

  const isEmptySearch = hasMinChars && restaurants.length === 0 && dishes.length === 0 && categories.length === 0

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          maxLength={40}
          onChange={(e) => setQuery(sanitize(e.target.value))}
          onFocus={() => {
            setFocused(true)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Поиск"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? flat[activeIndex]?.id : undefined}
          className="flex h-12 w-full rounded-2xl border border-input bg-surface pl-12 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          aria-label="Результаты поиска"
          className="absolute top-full mt-2 w-full rounded-2xl border bg-surface shadow-lg max-h-80 overflow-auto z-50"
        >
          {!hasMinChars ? (
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Популярные категории</p>
              <div className="flex flex-wrap gap-2">
                {quickCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQuery(c)
                      setFocused(true)
                      setIsOpen(true)
                      inputRef.current?.focus()
                    }}
                    className="rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Link
                href="/catalog"
                onClick={close}
                className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
              >
                Перейти в каталог →
              </Link>
            </div>
          ) : isEmptySearch ? (
            <div className="p-6 text-center">
              <p className="text-sm font-medium">Ничего не найдено — попробуйте «пицца»</p>
              <Link href="/catalog" onClick={close} className="mt-2 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="py-2">
              {restaurants.length > 0 && (
                <div>
                  <p className="px-4 py-1 text-xs font-semibold text-muted-foreground">Рестораны</p>
                  <ul role="group" aria-label="Рестораны">
                    {restaurants.map((r, idx) => {
                      const flatIdx = idx
                      const isActive = flatIdx === activeIndex
                      return (
                        <li key={r.id} role="option" aria-selected={isActive} id={`r-${r.id}`}>
                          <Link
                            href={`/restaurant/${r.slug}`}
                            onClick={close}
                            className={cn("flex items-center gap-3 px-4 py-2.5 hover:bg-muted focus-visible:outline-none focus-visible:bg-muted", isActive && "bg-muted")}
                          >
                            <img src={r.image} alt="" className="size-9 rounded-xl object-cover shrink-0 border" />
                            <span className="flex flex-col overflow-hidden text-left">
                              <span className="truncate text-sm font-medium">{highlight(r.name, debounced)}</span>
                              <span className="truncate text-xs text-muted-foreground">{highlight(r.cuisine, debounced)}</span>
                            </span>
                            <Store className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {dishes.length > 0 && (
                <div className={cn(restaurants.length > 0 && "border-t mt-2 pt-2")}>
                  <p className="px-4 py-1 text-xs font-semibold text-muted-foreground">Блюда</p>
                  <ul role="group" aria-label="Блюда">
                    {dishes.map((d, idx) => {
                      const flatIdx = restaurants.length + idx
                      const isActive = flatIdx === activeIndex
                      return (
                        <li key={d.id} role="option" aria-selected={isActive} id={`d-${d.id}`}>
                          <Link
                            href={`/restaurant/${d.restaurantSlug}`}
                            onClick={close}
                            className={cn("flex items-center gap-3 px-4 py-2.5 hover:bg-muted focus-visible:outline-none focus-visible:bg-muted", isActive && "bg-muted")}
                          >
                            <img src={d.image} alt="" className="size-9 rounded-xl object-cover shrink-0 border" />
                            <span className="flex flex-col overflow-hidden text-left">
                              <span className="truncate text-sm font-medium">{highlight(d.name, debounced)}</span>
                              <span className="truncate text-xs text-muted-foreground">{highlight(d.description.slice(0, 40), debounced)}</span>
                            </span>
                            <UtensilsCrossed className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {categories.length > 0 && (
                <div className={cn((restaurants.length > 0 || dishes.length > 0) && "border-t mt-2 pt-2")}>
                  <p className="px-4 py-1 text-xs font-semibold text-muted-foreground">Категории</p>
                  <ul role="group" aria-label="Категории">
                    {categories.map((c, idx) => {
                      const flatIdx = restaurants.length + dishes.length + idx
                      const isActive = flatIdx === activeIndex
                      return (
                        <li key={c} role="option" aria-selected={isActive} id={`c-${c}`}>
                          <Link
                            href="/catalog"
                            onClick={close}
                            className={cn("flex items-center gap-3 px-4 py-2.5 hover:bg-muted focus-visible:outline-none focus-visible:bg-muted", isActive && "bg-muted")}
                          >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-warm border shrink-0">
                              <Search className="size-4 text-primary" aria-hidden="true" />
                            </span>
                            <span className="text-sm font-medium">{highlight(c, debounced)}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
