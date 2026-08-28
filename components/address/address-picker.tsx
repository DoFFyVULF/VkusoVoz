"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Drawer } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAddressStore, formatAddress, type Address } from "@/lib/store/address"
import { useToast } from "@/components/ui/toast"
import { MapPin, Trash2 } from "lucide-react"

const schema = z.object({
  city: z.string().min(1, "Укажите город"),
  street: z.string().min(1, "Укажите улицу"),
  house: z.string().min(1, "Укажите дом"),
  apartment: z.string().optional(),
  entrance: z.string().optional(),
  floor: z.string().optional(),
  intercom: z.string().optional(),
  comment: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type AddressPickerProps = {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddressPicker({ children, open: controlledOpen, onOpenChange }: AddressPickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const address = useAddressStore((s) => s.address)
  const setAddress = useAddressStore((s) => s.setAddress)
  const clearAddress = useAddressStore((s) => s.clearAddress)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      city: address?.city ?? "",
      street: address?.street ?? "",
      house: address?.house ?? "",
      apartment: address?.apartment ?? "",
      entrance: address?.entrance ?? "",
      floor: address?.floor ?? "",
      intercom: address?.intercom ?? "",
      comment: address?.comment ?? "",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        city: address?.city ?? "",
        street: address?.street ?? "",
        house: address?.house ?? "",
        apartment: address?.apartment ?? "",
        entrance: address?.entrance ?? "",
        floor: address?.floor ?? "",
        intercom: address?.intercom ?? "",
        comment: address?.comment ?? "",
      })
    }
  }, [open, address, form])

  const onSubmit = (values: FormValues) => {
    const next: Address = {
      city: values.city.trim(),
      street: values.street.trim(),
      house: values.house.trim(),
      apartment: values.apartment?.trim() || undefined,
      entrance: values.entrance?.trim() || undefined,
      floor: values.floor?.trim() || undefined,
      intercom: values.intercom?.trim() || undefined,
      comment: values.comment?.trim() || undefined,
    }
    setAddress(next)
    toast({ title: "Адрес сохранён", description: formatAddress(next), variant: "success" })
    setOpen(false)
  }

  const handleClear = () => {
    clearAddress()
    toast({ title: "Адрес очищен", variant: "default" })
    setOpen(false)
  }

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="contents"
        aria-label="Выбрать адрес доставки"
      >
        {children}
      </span>

      <Drawer open={open} onOpenChange={setOpen} title="Адрес доставки" description="Куда привезти заказ">
        <div className="flex flex-col gap-3">
          {address && (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-3 py-2.5">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1 truncate text-sm font-medium">{formatAddress(address)}</span>
              <Button type="button" variant="ghost" size="sm" onClick={handleClear} aria-label="Очистить адрес" className="h-7 shrink-0 px-2.5 text-xs">
                <Trash2 className="size-3.5" aria-hidden="true" />
                Очистить
              </Button>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <Input label="Город" required placeholder="Москва" error={form.formState.errors.city?.message} {...form.register("city")} />
              <Input label="Улица" required placeholder="Тверская" error={form.formState.errors.street?.message} {...form.register("street")} />
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-2.5">
              <Input label="Дом" required placeholder="12" error={form.formState.errors.house?.message} {...form.register("house")} />
              <Input label="Квартира" placeholder="45" {...form.register("apartment")} />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <Input label="Подъезд" placeholder="2" {...form.register("entrance")} />
              <Input label="Этаж" placeholder="5" {...form.register("floor")} />
              <Input label="Домофон" placeholder="1234" {...form.register("intercom")} />
            </div>
            <Textarea label="Комментарий" placeholder="Код двери, ориентир..." rows={2} {...form.register("comment")} />

            <div className="flex gap-2.5 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-9 text-sm">
                Отмена
              </Button>
              <Button type="submit" className="flex-1 h-9 text-sm">
                Сохранить
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </>
  )
}
