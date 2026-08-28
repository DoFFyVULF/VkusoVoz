"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, Heart, ClipboardList, UserCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/lib/store/auth"
import { useToast } from "@/components/ui/toast"

const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN", "RESTAURANT_OWNER", "COURIER"] as const

export function UserMenu() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "П"

  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await api.auth.logout()
      useAuthStore.getState().clear()
      toast({ title: "Вы вышли", description: "До новых встреч", variant: "default" })
      try {
        localStorage.removeItem("vkusovoz-cart")
      } catch {}
      router.push("/")
      router.refresh()
    } catch {
      useAuthStore.getState().clear()
      toast({ title: "Вы вышли", description: "Сессия завершена", variant: "default" })
      router.push("/")
      router.refresh()
    } finally {
      setLoggingOut(false)
      setOpen(false)
    }
  }

  if (isLoading) {
    return (
      <span className="hidden size-11 items-center justify-center rounded-xl sm:inline-flex" aria-hidden="true">
        <span className="size-5 animate-pulse rounded-full bg-muted" />
      </span>
    )
  }

  if (user && (STAFF_ROLES as readonly string[]).includes(user.role)) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/login"
        aria-label="Войти"
        className="hidden size-11 items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
      >
        <User className="size-5" aria-hidden="true" />
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative hidden sm:inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Меню пользователя"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold ring-1 ring-border" aria-hidden="true">
          {initial}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] rounded-2xl border bg-popover p-1.5 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium leading-none">{user?.name ?? "Профиль"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link
            role="menuitem"
            href="/account"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            Профиль
          </Link>
          <Link
            role="menuitem"
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ClipboardList className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            Заказы
          </Link>
          <Link
            role="menuitem"
            href="/account/favorites"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Heart className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            Избранное
          </Link>
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <LogOut className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {loggingOut ? "Выход..." : "Выйти"}
          </button>
        </div>
      )}
    </div>
  )
}
