import { Ticket } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { promosMock } from "@/lib/mock-data"

export default function PromosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Промокоды</h1>
        <p className="text-sm text-muted-foreground">Применяйте промокоды при оформлении заказа — скидка рассчитается автоматически</p>
      </div>

      {promosMock.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Активных промокодов пока нет</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {promosMock.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Ticket className="size-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-base font-bold tracking-widest">{p.code}</span>
                    <span className="text-xs text-muted-foreground">{p.validUntil}</span>
                  </div>
                  <span className="ml-auto rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">{p.discount}</span>
                </div>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
                <div className="rounded-lg border bg-muted px-3 py-2 text-xs">Скопируйте код и вставьте на этапе оформления</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
