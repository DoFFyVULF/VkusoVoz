"use client"

import * as React from "react"
import Link from "next/link"
import { Package, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/status-pill"
import { EmptyState } from "@/components/ui/empty-state"
import { ordersMock } from "@/lib/mock-data"
import { useToast } from "@/components/ui/toast"
import { formatPrice } from "@/lib/store/cart"

const statusMap: Record<string, "pending" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled"> = {
  pending: "pending",
  confirmed: "confirmed",
  preparing: "preparing",
  delivering: "delivering",
  delivered: "delivered",
  cancelled: "cancelled",
}

export default function OrdersPage() {
  const { toast } = useToast()
  const [filter, setFilter] = React.useState<string>("all")
  const filtered = filter === "all" ? ordersMock : ordersMock.filter((o) => o.status === filter)

  if (ordersMock.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold tracking-tight">Заказы</h1>
        <EmptyState title="Заказов пока нет" description="Оформите первый заказ — он появится здесь с отслеживанием статуса" icon={<Package className="size-8" />} actionLabel="Перейти в каталог" onAction={() => (window.location.href = "/catalog")} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Заказы</h1>
        <p className="text-sm text-muted-foreground">История заказов · повторите в один клик</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
        {[
          { v: "all", l: "Все" },
          { v: "delivering", l: "В пути" },
          { v: "delivered", l: "Доставленные" },
          { v: "cancelled", l: "Отменённые" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border min-h-9 ${filter === f.v ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Ничего не найдено" description="Попробуйте другой фильтр" />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((o) => (
            <Card key={o.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{o.number}</span>
                    <span className="text-xs text-muted-foreground">{o.date}</span>
                    <StatusPill status={statusMap[o.status] ?? "pending"} label={o.statusLabel} />
                  </div>
                  <span className="text-sm font-bold tabular-nums">{formatPrice(o.total)}</span>
                </div>
                <p className="text-sm">
                  <span className="font-medium">{o.restaurant}</span> · <span className="text-muted-foreground">{o.items}</span>
                </p>
                <p className="text-xs text-muted-foreground">{o.address}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Заказ повторён", description: `${o.restaurant} · добавлен в корзину`, variant: "success" })}>
                    <RotateCcw className="size-4" /> Повторить
                  </Button>
                  <Link href={`/order/${o.id}`} className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Подробнее
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
