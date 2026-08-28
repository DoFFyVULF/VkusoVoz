"use client"

import Link from "next/link"
import type { Route } from "next"
import { usePathname } from "next/navigation"
import { User, MapPin, Package, Heart, Star, Ticket, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs: ReadonlyArray<{ href: Route; label: string; icon: typeof User; exact?: boolean }> = [
  { href: "/account", label: "Профиль", icon: User, exact: true },
  { href: "/account/addresses", label: "Адреса", icon: MapPin },
  { href: "/account/orders", label: "Заказы", icon: Package },
  { href: "/account/favorites", label: "Избранное", icon: Heart },
  { href: "/account/reviews", label: "Отзывы", icon: Star },
  { href: "/account/promos", label: "Промокоды", icon: Ticket },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-8">
      <aside className="w-full shrink-0 lg:w-[260px]">
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 lg:sticky lg:top-[76px]">
          <div className="flex items-center gap-3 border-b pb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Settings className="size-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Личный кабинет</span>
              <span className="text-xs text-muted-foreground">Управление аккаунтом</span>
            </div>
          </div>

          <nav aria-label="Разделы кабинета" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0 scrollbar-none -mx-1 px-1 lg:mx-0 lg:px-0">
            {tabs.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname === href || pathname?.startsWith(href + "/") || pathname === href
              const isProfileActive = exact && pathname === "/account"
              const isActive = exact ? isProfileActive : pathname?.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-11 whitespace-nowrap",
                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
