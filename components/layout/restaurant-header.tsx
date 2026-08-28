"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Store, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"

const NAV = [
  { label: "Дашборд", href: "/restaurant-panel" },
  { label: "Заказы", href: "/restaurant-panel?tab=orders" },
  { label: "Меню", href: "/restaurant-panel?tab=menu" },
  { label: "Стоп-лист", href: "/restaurant-panel?tab=stoplist" },
] as const

export function RestaurantHeader() {
  const router = useRouter()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "Р"

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

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center border-b bg-card px-4 lg:px-6">
      <div className="flex w-full items-center gap-4">
        <Link href="/restaurant-panel" className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Store className="size-4" />
          </span>
          <span className="hidden text-sm font-bold tracking-tight sm:inline">ВкусоВоз</span>
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">· Ресторан</span>
          <span className="inline text-sm font-bold sm:hidden">ВВ · Ресторан</span>
        </Link>

        <nav aria-label="Навигация ресторана" className="hidden items-center gap-1 lg:flex ml-6">
          {NAV.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 sm:flex">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">{initial}</span>
            <span className="hidden flex-col lg:flex">
              <span className="max-w-[140px] truncate text-xs font-medium leading-none">{user?.name ?? "Владелец"}</span>
              <span className="inline-flex rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-secondary-foreground">RESTAURANT_OWNER</span>
            </span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut} className="hidden sm:inline-flex">
            <LogOut className="size-4" /> Выйти
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
          <nav className="flex flex-col gap-1">
            {NAV.map((t) => (
              <Link key={t.label} href={t.href} onClick={() => setMobileOpen(false)} className="rounded-xl bg-muted/50 px-3 py-2.5 text-sm font-medium hover:bg-muted">
                {t.label}
              </Link>
            ))}
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={loggingOut} className="mt-3 w-fit">
              <LogOut className="size-4" /> Выйти
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
