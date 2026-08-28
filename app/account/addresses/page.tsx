"use client"

import * as React from "react"
import { Plus, Trash2, Pencil, MapPin, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { EmptyState } from "@/components/ui/empty-state"
import { addressesMock, type AddressMock } from "@/lib/mock-data"
import { useToast } from "@/components/ui/toast"

export default function AddressesPage() {
  const { toast } = useToast()
  const [addresses, setAddresses] = React.useState<AddressMock[]>(addressesMock)
  const [editing, setEditing] = React.useState<AddressMock | null>(null)
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState({ label: "", value: "" })

  const handleOpenAdd = () => {
    setEditing(null)
    setDraft({ label: "", value: "" })
    setOpen(true)
  }
  const handleOpenEdit = (a: AddressMock) => {
    setEditing(a)
    setDraft({ label: a.label, value: a.value })
    setOpen(true)
  }
  const handleSave = () => {
    if (!draft.value.trim()) {
      toast({ title: "Укажите адрес", variant: "destructive" })
      return
    }
    if (editing) {
      setAddresses((prev) => prev.map((x) => (x.id === editing.id ? { ...x, label: draft.label || x.label, value: draft.value } : x)))
      toast({ title: "Адрес обновлён", variant: "success" })
    } else {
      setAddresses((prev) => [...prev, { id: Math.random().toString(36).slice(2, 7), label: draft.label || "Новый", value: draft.value }])
      toast({ title: "Адрес добавлен", variant: "success" })
    }
    setOpen(false)
  }
  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((x) => x.id !== id))
    toast({ title: "Адрес удалён" })
  }
  const handleDefault = (id: string) => {
    setAddresses((prev) => prev.map((x) => ({ ...x, isDefault: x.id === id })))
    toast({ title: "Адрес по умолчанию обновлён", variant: "success" })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Адреса</h1>
          <p className="text-sm text-muted-foreground">Сохраните адреса — оформляйте заказ в один клик</p>
        </div>
        <Button onClick={handleOpenAdd}><Plus className="size-4" /> Добавить адрес</Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState title="Нет сохранённых адресов" description="Добавьте первый адрес — мы подскажем при оформлении заказа" actionLabel="Добавить адрес" onAction={handleOpenAdd} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id} className={a.isDefault ? "ring-2 ring-primary/20" : ""}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                    <MapPin className="size-3.5" /> {a.label}
                  </span>
                  {a.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                      <Star className="size-3" /> По умолчанию
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{a.value}</p>
                <div className="aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-warm to-muted text-xs text-muted-foreground">
                    <MapPin className="mr-1 size-4 text-primary" /> Карта · {a.lat?.toFixed(2) ?? "55.76"}, {a.lng?.toFixed(2) ?? "37.61"} — заглушка MapView
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!a.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => handleDefault(a.id)}>
                      Сделать основным
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(a)}>
                    <Pencil className="size-3.5" /> Изменить
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="size-3.5" /> Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Редактировать адрес" : "Новый адрес"}>
        <div className="flex flex-col gap-4">
          <Input label="Название" placeholder="Дом, Работа" value={draft.label} onChange={(e) => setDraft((s) => ({ ...s, label: e.target.value }))} />
          <Input label="Адрес" required placeholder="Москва, ул. Тверская, 12 · кв. 45" value={draft.value} onChange={(e) => setDraft((s) => ({ ...s, value: e.target.value }))} />
          <div className="rounded-xl border bg-warm p-3 text-xs text-muted-foreground">
            Подсказка: начните вводить адрес — мы предложим варианты (демо: ручной ввод). Координаты подставятся автоматически.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Отмена</Button>
            <Button onClick={handleSave} className="flex-1">Сохранить</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
