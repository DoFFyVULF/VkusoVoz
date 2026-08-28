"use client"

import * as React from "react"
import Link from "next/link"
import { Star, CheckCircle2, XCircle, Eye, MoreHorizontal } from "lucide-react"
import { AdminTable, usePagedResource, type Column } from "./admin-table"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/store/cart"

const ROLE_LABELS: Record<string, string> = {
  USER: "Пользователь",
  RESTAURANT_OWNER: "Владелец",
  RESTAURANT_STAFF: "Сотрудник",
  COURIER: "Курьер",
  ADMIN: "Администратор",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает",
  CONFIRMED: "Подтверждён",
  PREPARING: "Готовится",
  READY: "Готов",
  OUT_FOR_DELIVERY: "В пути",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
  REFUNDED: "Возврат",
}

const REVIEW_STATUS_LABELS: Record<string, string> = {
  PENDING: "На модерации",
  APPROVED: "Опубликован",
  REJECTED: "Отклонён",
  HIDDEN: "Скрыт",
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ---------- Users ----------

type AdminUser = {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
  image: string | null
}

export function AdminUsersTable() {
  const url = React.useCallback(
    (page: number) => `/api/v1/admin/users?page=${page}&limit=20`,
    []
  )
  const state = usePagedResource<AdminUser>(url)

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Email",
      render: (u) => (
        <div className="flex flex-col">
          <span className="font-medium">{u.email}</span>
          <span className="text-xs text-muted-foreground">{u.name}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Роль",
      render: (u) => <Badge variant="muted">{ROLE_LABELS[u.role] ?? u.role}</Badge>,
    },
    {
      key: "active",
      header: "Активен",
      render: (u) =>
        u.isActive ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" /> Да
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <XCircle className="size-3.5" aria-hidden="true" /> Нет
          </span>
        ),
    },
    {
      key: "created",
      header: "Дата регистрации",
      cellClassName: "tabular-nums text-xs text-muted-foreground",
      render: (u) => formatDate(u.createdAt),
    },
    {
      key: "actions",
      header: "Действия",
      cellClassName: "text-right",
      render: () => (
        <Button size="sm" variant="ghost" className="size-8 p-0" aria-label="Подробнее">
          <MoreHorizontal className="size-4" />
        </Button>
      ),
    },
  ]

  return (
    <AdminTable
      title="Пользователи"
      rows={state.items}
      columns={columns}
      page={state.page}
      pages={state.pages}
      total={state.total}
      onPageChange={state.setPage}
      isLoading={state.isLoading}
      errorMessage={state.error}
      toolbar={
        <Button size="sm" variant="outline" disabled>
          Экспорт CSV
        </Button>
      }
    />
  )
}

// ---------- Orders ----------

type AdminOrder = {
  id: string
  number: string
  status: string
  total: number
  createdAt: string
  user: { id: string; name: string; email: string }
  restaurant: { id: string; name: string; slug: string }
}

const STATUS_VARIANT: Record<string, "muted" | "default" | "danger" | "success"> = {
  PENDING: "muted",
  CONFIRMED: "success",
  PREPARING: "default",
  READY: "default",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "muted",
}

export function AdminOrdersTable() {
  const url = React.useCallback(
    (page: number) => `/api/v1/admin/orders?page=${page}&limit=20`,
    []
  )
  const state = usePagedResource<AdminOrder>(url)

  const columns: Column<AdminOrder>[] = [
    {
      key: "number",
      header: "№",
      cellClassName: "tabular-nums font-medium",
      render: (o) => o.number,
    },
    {
      key: "status",
      header: "Статус",
      render: (o) => (
        <Badge variant={STATUS_VARIANT[o.status] ?? "muted"}>
          {STATUS_LABELS[o.status] ?? o.status}
        </Badge>
      ),
    },
    {
      key: "restaurant",
      header: "Ресторан",
      render: (o) => (
        <Link
          href={`/restaurant/${o.restaurant.slug}`}
          className="text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {o.restaurant.name}
        </Link>
      ),
    },
    {
      key: "total",
      header: "Сумма",
      cellClassName: "tabular-nums",
      render: (o) => formatPrice(o.total),
    },
    {
      key: "date",
      header: "Дата",
      cellClassName: "tabular-nums text-xs text-muted-foreground",
      render: (o) => formatDateTime(o.createdAt),
    },
    {
      key: "actions",
      header: "",
      cellClassName: "text-right",
      render: (o) => (
        <Link
          href={`/order/${o.id}`}
          aria-label={`Открыть заказ ${o.number}`}
          className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Eye className="size-4" />
        </Link>
      ),
    },
  ]

  return (
    <AdminTable
      title="Заказы"
      rows={state.items}
      columns={columns}
      page={state.page}
      pages={state.pages}
      total={state.total}
      onPageChange={state.setPage}
      isLoading={state.isLoading}
      errorMessage={state.error}
      toolbar={
        <Button size="sm" variant="outline" disabled>
          Экспорт CSV
        </Button>
      }
    />
  )
}

// ---------- Promos ----------

type AdminPromo = {
  id: string
  code: string
  discountType: string
  discountValue: number
  minOrderAmount: number | null
  usageLimit: number | null
  usedCount: number
  validFrom: string
  validUntil: string | null
  isActive: boolean
}

function DiscountLabel(p: AdminPromo) {
  if (p.discountType === "PERCENT") return `−${p.discountValue}%`
  return `−${formatPrice(p.discountValue)}`
}

export function AdminPromosTable() {
  const url = React.useCallback(
    (page: number) => `/api/v1/admin/promos?page=${page}&limit=20`,
    []
  )
  const state = usePagedResource<AdminPromo>(url)

  const columns: Column<AdminPromo>[] = [
    {
      key: "code",
      header: "Код",
      cellClassName: "font-mono font-semibold",
      render: (p) => p.code,
    },
    {
      key: "type",
      header: "Тип",
      render: (p) => (
        <Badge variant="muted">{p.discountType === "PERCENT" ? "Процент" : "Фикс"}</Badge>
      ),
    },
    {
      key: "value",
      header: "Значение",
      cellClassName: "tabular-nums",
      render: (p) => DiscountLabel(p),
    },
    {
      key: "min",
      header: "Мин. сумма",
      cellClassName: "tabular-nums text-muted-foreground",
      render: (p) => (p.minOrderAmount ? formatPrice(p.minOrderAmount) : "—"),
    },
    {
      key: "limit",
      header: "Лимит / использовано",
      cellClassName: "tabular-nums text-xs",
      render: (p) =>
        p.usageLimit ? `${p.usedCount} / ${p.usageLimit}` : `${p.usedCount} / ∞`,
    },
    {
      key: "active",
      header: "Активен",
      render: (p) => (
        <Badge variant={p.isActive ? "default" : "muted"}>
          {p.isActive ? "Да" : "Нет"}
        </Badge>
      ),
    },
  ]

  return (
    <AdminTable
      title="Промокоды"
      rows={state.items}
      columns={columns}
      page={state.page}
      pages={state.pages}
      total={state.total}
      onPageChange={state.setPage}
      isLoading={state.isLoading}
      errorMessage={state.error}
      emptyMessage="Промокодов пока нет"
    />
  )
}

// ---------- Reviews ----------

type AdminReview = {
  id: string
  rating: number
  text: string | null
  status: string
  createdAt: string
  user: { id: string; name: string }
  restaurant: { id: string; name: string; slug: string }
}

export function AdminReviewsTable() {
  const url = React.useCallback(
    (page: number) => `/api/v1/admin/reviews?page=${page}&limit=20`,
    []
  )
  const state = usePagedResource<AdminReview>(url)

  const columns: Column<AdminReview>[] = [
    {
      key: "restaurant",
      header: "Ресторан",
      render: (r) => (
        <Link
          href={`/restaurant/${r.restaurant.slug}`}
          className="text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {r.restaurant.name}
        </Link>
      ),
    },
    {
      key: "rating",
      header: "Оценка",
      render: (r) => <Rating value={r.rating} readonly size="sm" />,
    },
    {
      key: "text",
      header: "Текст",
      render: (r) => (
        <p className={cn("max-w-[420px] truncate text-sm text-muted-foreground")}>
          {r.text ?? "—"}
        </p>
      ),
    },
    {
      key: "status",
      header: "Статус",
      render: (r) => (
        <Badge
          variant={
            r.status === "APPROVED"
              ? "success"
              : r.status === "REJECTED"
                ? "danger"
                : "muted"
          }
        >
          {REVIEW_STATUS_LABELS[r.status] ?? r.status}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Дата",
      cellClassName: "tabular-nums text-xs text-muted-foreground",
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: "actions",
      header: "",
      cellClassName: "text-right",
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" className="text-success" aria-label="Одобрить">
            <CheckCircle2 className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" aria-label="Отклонить">
            <XCircle className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AdminTable
      title="Отзывы · модерация"
      rows={state.items}
      columns={columns}
      page={state.page}
      pages={state.pages}
      total={state.total}
      onPageChange={state.setPage}
      isLoading={state.isLoading}
      errorMessage={state.error}
    />
  )
}

// ---------- Restaurants ----------

type AdminRestaurant = {
  id: string
  name: string
  slug: string
  status: string
  rating: number
  reviewCount: number
  isActive: boolean
}

const RESTAURANT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Черновик",
  PENDING_MODERATION: "На модерации",
  ACTIVE: "Активен",
  PAUSED: "На паузе",
  BLOCKED: "Заблокирован",
  CLOSED: "Закрыт",
}

export function AdminRestaurantsTable() {
  // Используем публичный /api/v1/restaurants (он уже работает с моком).
  const url = React.useCallback(
    (page: number) => `/api/v1/restaurants?sort=rating&order=desc&page=${page}&limit=20`,
    []
  )
  const state = usePagedResource<AdminRestaurant>(url)

  const columns: Column<AdminRestaurant>[] = [
    {
      key: "name",
      header: "Название",
      render: (r) => (
        <Link
          href={`/restaurant/${r.slug}`}
          className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {r.name}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Статус",
      render: (r) => (
        <Badge variant={r.status === "ACTIVE" ? "default" : "muted"}>
          {RESTAURANT_STATUS_LABELS[r.status] ?? r.status}
        </Badge>
      ),
    },
    {
      key: "rating",
      header: "Рейтинг",
      cellClassName: "tabular-nums",
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
          {r.rating.toFixed(1)}
          <span className="text-xs text-muted-foreground">· {r.reviewCount}</span>
        </span>
      ),
    },
    {
      key: "active",
      header: "Активен",
      render: (r) => (r.isActive ? "Да" : "Нет"),
    },
    {
      key: "actions",
      header: "",
      cellClassName: "text-right",
      render: () => (
        <Button size="sm" variant="ghost" aria-label="Подробнее">
          <MoreHorizontal className="size-4" />
        </Button>
      ),
    },
  ]

  return (
    <AdminTable
      title="Заведения"
      rows={state.items}
      columns={columns}
      page={state.page}
      pages={state.pages}
      total={state.total}
      onPageChange={state.setPage}
      isLoading={state.isLoading}
      errorMessage={state.error}
    />
  )
}
