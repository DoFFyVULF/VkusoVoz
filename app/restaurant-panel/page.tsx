import { Store, Package, UtensilsCrossed, Ban, TrendingUp, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StatusPill } from "@/components/ui/status-pill"
import { Button } from "@/components/ui/button"

const stats = [
  { label: "Заказов сегодня", value: "18", icon: Package, hint: "+3 к вчера" },
  { label: "Выручка", value: "42 300 ₽", icon: TrendingUp, hint: "за сегодня" },
  { label: "Среднее время готовки", value: "22 мин", icon: Clock, hint: "цель <25 мин" },
  { label: "В стоп-листе", value: "2", icon: Ban, hint: "блюда" },
]

export default function RestaurantPanelPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Store className="size-5" /></span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Кабинет ресторана</h1>
            <p className="text-sm text-muted-foreground">Mamma Roma · дашборд, заказы, меню, стоп-лист</p>
          </div>
        </div>
        <Button variant="outline">Настройки заведения</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-2 p-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-warm border text-primary"><Icon className="size-4" /></span>
              <span className="text-2xl font-bold tracking-tight">{value}</span>
              <span className="text-xs font-medium text-muted-foreground">{label} · {hint}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Активные заказы</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[
            { id: "#48291", status: "confirmed" as const, label: "Подтверждён", items: "Маргарита ×1, Карбонара ×1", time: "18:42 · Доставка · 1210 ₽" },
            { id: "#48288", status: "preparing" as const, label: "Готовится", items: "Пепперони ×2", time: "18:38 · Самовывоз · 1380 ₽" },
            { id: "#48285", status: "pending" as const, label: "Новый", items: "Четыре сыра ×1", time: "18:35 · Доставка · 790 ₽" },
          ].map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{o.id}</span>
                  <StatusPill status={o.status} label={o.label} />
                </div>
                <span className="text-sm text-muted-foreground">{o.items} · {o.time}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Отклонить</Button>
                <Button size="sm">Принять</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UtensilsCrossed className="size-4 text-primary" /> Управление меню</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Категории, блюда, опциональные группы · перетаскивание для сортировки (заглушка)</p>
            <div className="rounded-xl border bg-muted p-4 text-sm">Пицца (3) · Паста (2) · Салаты (1) · <Button size="sm" variant="outline" className="ml-2">Добавить блюдо</Button></div>
            <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">Таблица блюд с ценами, наличием, «хит/новое»</div>
          </CardContent>
        </Card>

        <Card className="border-warning/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Ban className="size-4 text-warning" /> Стоп-лист</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Временно скрывайте блюда, если закончились ингредиенты</p>
            {[
              { name: "Болоньезе", reason: "Нет тальятелле" },
              { name: "Удон с курицей", reason: "До завтра" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl border bg-warning/5 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.reason}</p>
                </div>
                <Button size="sm" variant="outline">Вернуть</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-fit">+ Добавить в стоп-лист</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
