"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Shield, Store, Users, Package, Ticket, Star, ScrollText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { value: "restaurants", label: "Заведения", icon: Store, href: "/admin?tab=restaurants" },
  { value: "users", label: "Пользователи", icon: Users, href: "/admin?tab=users" },
  { value: "orders", label: "Заказы", icon: Package, href: "/admin?tab=orders" },
  { value: "promos", label: "Промокоды", icon: Ticket, href: "/admin?tab=promos" },
  { value: "reviews", label: "Отзывы", icon: Star, href: "/admin?tab=reviews" },
] as const

const SYSTEM = [
  { label: "Логи", icon: ScrollText, href: "/admin/logs" },
  { label: "Настройки", icon: Settings, href: "/admin/settings" },
] as const

export function AdminSidebar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const activeTab = searchParams.get("tab") ?? "restaurants"
  const isAdminRoot = pathname === "/admin"

  return (
    <aside
      aria-label="Боковая навигация админки"
      className="hidden w-[220px] shrink-0 flex-col border-r bg-surface lg:flex"
    >
      <div className="flex flex-1 flex-col gap-6 px-3 py-4">
        <nav aria-label="Разделы админки" className="flex flex-col gap-1">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Управление</p>
          {NAV.map(({ value, label, icon: Icon, href }) => {
            const active = isAdminRoot && activeTab === value
            return (
              <Link
                key={value}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="h-px bg-border" aria-hidden="true" />

        <nav aria-label="Система" className="flex flex-col gap-1">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Система</p>
          {SYSTEM.map(({ label, icon: Icon, href }) => {
            const active = pathname === href || (pathname?.startsWith(`${href}/`) ?? false)
            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-dashed p-3">
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">Админ-режим</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Изолированная оболочка. Публичная шапка и корзина скрыты.</p>
        </div>
      </div>
    </aside>
  )
}
