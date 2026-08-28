"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import {
  AdminRestaurantsTable,
  AdminUsersTable,
  AdminOrdersTable,
  AdminPromosTable,
  AdminReviewsTable,
} from "@/components/admin/admin-tables"

const TABLES = {
  restaurants: { title: "Заведения", component: AdminRestaurantsTable },
  users: { title: "Пользователи", component: AdminUsersTable },
  orders: { title: "Заказы", component: AdminOrdersTable },
  promos: { title: "Промокоды", component: AdminPromosTable },
  reviews: { title: "Отзывы", component: AdminReviewsTable },
} as const

type TabKey = keyof typeof TABLES

export default function AdminPage() {
  const searchParams = useSearchParams()
  const raw = searchParams.get("tab")
  const tab: TabKey = (raw && raw in TABLES ? raw : "restaurants") as TabKey
  const Table = TABLES[tab].component

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight">Админ-панель</h1>
        <p className="text-sm text-muted-foreground">
          Модерация заведений, пользователей, заказов, промокодов и отзывов
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="p-4">
            <Table />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
