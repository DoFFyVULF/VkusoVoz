"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Shield, LogOut, Menu, X, Store, Users, Package, Ticket, Star } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/lib/store/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const ADMIN_TABS = [
  { value: "restaurants", label: "Заведения", href: "/admin?tab=restaurants", icon: Store },
  { value: "users", label: "Пользователи", href: "/admin?tab=users", icon: Users },
  { value: "orders", label: "Заказы", href: "/admin?tab=orders", icon: Package },
  { value: "promos", label: "Промокоды", href: "/admin?tab=promos", icon: Ticket },
  { value: "reviews", label: "Отзывы", href: "/admin?tab=reviews", icon: Star },
] as const

export function AdminHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const activeTab = searchParams.get("tab") ?? "restaurants"
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await api.auth.logout()
      useAuthStore.getState().clear()
      router.push("/auth/login")
      router.refresh()
    } catch {
      useAuthStore.getState().clear()
      router.push("/auth/login")
    } finally {
      setLoggingOut(false)
    }
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "А"

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center border-b bg-card px-4 lg:px-6">
      <div className="flex w-full items-center gap-4">
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="ВкусоВоз Админ — на главную админки"
        >
         <Image src="/logo.png" alt="ВкусоВоз" width={52} height={52} className="rounded-lg" />
          <span className="hidden text-sm font-bold tracking-tight sm:inline">ВкусоВоз</span>
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">· Админ</span>
          <span className="inline text-sm font-bold tracking-tight sm:hidden">ВВ · Админ</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {initial}
            </span>
            <span className="hidden flex-col items-start lg:flex">
              <span className="max-w-[140px] truncate text-xs font-medium leading-none">{user?.name ?? user?.email ?? "Администратор"}</span>
              <span className="inline-flex items-center rounded-full bg-foreground mt-1 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-background">
                {user?.role ?? "ADMIN"}
              </span>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut} className="hidden sm:inline-flex" aria-label="Выйти">
            <LogOut className="size-4" />
            Выйти
          </Button>
          <button
            type="button"
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-xl border bg-card hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-14 z-40 border-b bg-card p-4 shadow-lg lg:hidden">
          <nav aria-label="Админ-навигация мобильная" className="flex flex-col gap-1">
            {ADMIN_TABS.map((t) => {
              const active = activeTab === t.value
              const Icon = t.icon
              return (
                <Link
                  key={t.value}
                  href={t.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-foreground text-background" : "bg-muted/50 text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {t.label}
                </Link>
              )
            })}
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">{initial}</span>
                <span className="text-xs font-medium">{user?.email ?? "Администратор"}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={loggingOut}>
                <LogOut className="size-4" />
                Выйти
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
