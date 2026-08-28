"use client"

import * as React from "react"
import Link from "next/link"
import type { Route } from "next"
import { usePathname } from "next/navigation"
import { House, LayoutGrid, ShoppingBag, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  href: Route
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const items: NavItem[] = [
  { href: "/", label: "Главная", icon: House },
  { href: "/catalog", label: "Каталог", icon: LayoutGrid },
  { href: "/cart", label: "Корзина", icon: ShoppingBag, badge: 3 },
  { href: "/account/favorites", label: "Избранное", icon: Heart },
  { href: "/account", label: "Профиль", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Нижняя навигация"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <span className="relative">
                <Icon className="size-5" aria-hidden="true" />
                {typeof badge === "number" && badge > 0 ? (
                  <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground">
                    {badge}
                  </span>
                ) : null}
              </span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
