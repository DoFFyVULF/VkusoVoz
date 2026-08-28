"use client"

import * as React from "react"
import { Bike, MapPin, Clock, CheckCircle2, Phone, Navigation } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/status-pill"
import { useToast } from "@/components/ui/toast"

type CourierOrder = {
  id: string
  restaurant: string
  address: string
  total: string
  status: "available" | "accepted" | "picked" | "delivering"
}

// Статусы для отображения в UI
const STATUS_LABELS: Record<CourierOrder["status"], { label: string; icon?: React.ReactNode }> = {
  available: { label: "Доступен" },
  accepted: { label: "Принят" },
  picked: { label: "Забран" },
  delivering: { label: "В пути" },
}

const mockAvailable: CourierOrder[] = [
  { id: "№ 48291", restaurant: "Mamma Roma", address: "ул. Тверская, 12 · кв. 45", total: "1 210 ₽", status: "available" },
  { id: "№ 48288", restaurant: "Печкин Дом", address: "ул. Арбат, 5", total: "840 ₽", status: "available" },
]

export default function CourierPage() {
  const { toast } = useToast()
  const [orders, setOrders] = React.useState<CourierOrder[]>(mockAvailable)
  const [active, setActive] = React.useState<CourierOrder | null>(null)

  const accept = (o: CourierOrder) => {
    setActive({ ...o, status: "accepted" })
    setOrders((prev) => prev.filter((x) => x.id !== o.id))
    toast({ title: "Заказ принят", description: `${o.id} · ${o.restaurant}`, variant: "success" })
  }

  const advance = () => {
    if (!active) return
    const next: Record<NonNullable<CourierOrder["status"]>, CourierOrder["status"]> = { available: "accepted", accepted: "picked", picked: "delivering", delivering: "delivering" }
    const n = next[active.status]
    if (n === active.status) {
      toast({ title: "Доставлено", variant: "success" })
      setActive(null)
    } else {
      setActive({ ...active, status: n })
      toast({ title: n === "picked" ? "Забрал из ресторана" : "В пути к клиенту" })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Bike className="size-5" /></span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Кабинет курьера</h1>
          <p className="text-sm text-muted-foreground">Доступные заказы · принятие · статусы доставки</p>
        </div>
      </div>

      {active && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">Активный заказ {active.id} <StatusPill status={active.status === "accepted" ? "confirmed" : active.status === "picked" ? "preparing" : "delivering"} label={active.status === "accepted" ? "Принят" : active.status === "picked" ? "Забран" : "В пути"} /></CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm">{active.restaurant} · {active.address} · {active.total}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card border px-3 py-1.5 text-xs"><MapPin className="size-3.5" /> Открыть карту</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card border px-3 py-1.5 text-xs"><Phone className="size-3.5" /> Связаться</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card border px-3 py-1.5 text-xs"><Navigation className="size-3.5" /> Навигация</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={advance} className="flex-1">
                {active.status === "accepted" ? "Забрал заказ" : active.status === "picked" ? "Выехал к клиенту" : "Доставлен"}
              </Button>
              <Button variant="outline" onClick={() => setActive(null)}>Отменить</Button>
            </div>
            <ol className="flex items-center gap-2 text-xs">
              {["Принят", "Забран", "В пути", "Доставлен"].map((s, i) => {
                const idx = { available: 0, accepted: 0, picked: 1, delivering: 2 }[active.status] ?? 0
                const done = i <= idx
                return <li key={s} className={`flex items-center gap-1 ${done ? "text-success font-medium" : "text-muted-foreground"}`}><CheckCircle2 className={`size-4 ${done ? "text-success" : "text-muted"}`} />{s}</li>
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Доступные заказы</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">Новых заказов пока нет — потяните чтобы обновить</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold">{o.id}</span><span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3.5" /> 5 мин назад</span></div>
                  <span className="text-sm">{o.restaurant} · {o.total}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />{o.address}</span>
                </div>
                <Button size="sm" onClick={() => accept(o)}>Принять</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
