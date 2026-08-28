"use client"

import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { reviewsMock } from "@/lib/mock-data"

export default function ReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Отзывы</h1>
        <p className="text-sm text-muted-foreground">Ваши отзывы проходят модерацию перед публикацией</p>
      </div>

      {reviewsMock.length === 0 ? (
        <EmptyState title="Вы ещё не оставили отзывов" description="После доставки вы сможете оценить ресторан и блюда" />
      ) : (
        <div className="flex flex-col gap-4">
          {reviewsMock.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{r.restaurant}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${r.status === "approved" ? "bg-success/10 text-success border-success/20" : r.status === "pending" ? "bg-warning/10 text-warning border-warning/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                    {r.statusLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-4 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="text-sm leading-relaxed">{r.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
