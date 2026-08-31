"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Clock, Bike, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeliveryToggle } from "@/components/ui/delivery-toggle"
import { AddressPicker } from "@/components/address/address-picker"
import { useAddressStore } from "@/lib/store/address"
import { useDeliveryStore } from "@/lib/store/delivery"
import { useToast } from "@/components/ui/toast"

export function HeroSection() {
  const router = useRouter()
  const address = useAddressStore((s) => s.address)
  const mode = useDeliveryStore((s) => s.mode)
  const { toast } = useToast()
  const [pickerOpen, setPickerOpen] = React.useState(false)

  const handleShowNearby = () => {
    if (!address) {
      setPickerOpen(true)
      toast({ title: "Укажите адрес", description: "Введите адрес доставки, чтобы найти рядом", variant: "info" })
      return
    }
    router.push("/catalog")
  }

  const feeHint = mode === "pickup" ? "Скидка 10%" : "Бесплатно от 500 ₽"

  return (
    <section className="relative overflow-hidden rounded-[20px] border border-border bg-surface sm:rounded-[24px]">
      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-warm px-3 py-1 text-[11px] font-semibold text-primary sm:text-xs">
            <span className="size-2 shrink-0 rounded-full bg-success animate-pulse" aria-hidden="true" />
            Доставляем за 25–35 минут
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-[24px] font-bold leading-[1.05] tracking-tight sm:text-[28px] lg:text-[36px]">
              Тёплая гастрономия <br className="hidden sm:inline" />
              <span className="text-primary">с доставкой до двери</span>
            </h1>
            <p className="max-w-[520px] text-[13px] leading-relaxed text-muted-foreground sm:text-sm lg:text-base">
              Выбирайте из любимых ресторанов города. Свежие блюда из локальных продуктов, быстрая доставка и забота в каждой детали.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-background p-2.5 sm:gap-3 sm:p-3">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <AddressPicker open={pickerOpen} onOpenChange={setPickerOpen}>
                <button
                  type="button"
                  aria-label="Выбрать адрес доставки"
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-input bg-surface px-2.5 py-2 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-11 sm:px-3"
                >
                  <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <span className="text-xs text-muted-foreground leading-none">Адрес доставки</span>
                    {address ? (
                      <span className="truncate text-[13px] font-medium sm:text-sm">{`${address.street}, ${address.house}`}</span>
                    ) : (
                      <span className="truncate text-[13px] font-medium text-muted-foreground sm:text-sm">Укажите адрес — ул. Тверская, 12</span>
                    )}
                  </span>
                </button>
              </AddressPicker>
              <Button onClick={handleShowNearby} className="hidden shrink-0 lg:inline-flex min-h-11">
                Показать рядом
              </Button>
              <Button onClick={handleShowNearby} aria-label="Показать рядом" className="shrink-0 lg:hidden min-h-11 px-3 text-[13px] sm:px-4 sm:text-sm">
                Найти
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 gap-y-2 min-w-0">
              <DeliveryToggle className="shrink-0" />
              <span className="whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">· {feeHint}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-muted-foreground sm:gap-4 sm:text-xs">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Clock className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" /> 25–35 мин</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Bike className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" /> от 0 ₽</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><ShieldCheck className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" /> Контроль качества</span>
          </div>
        </div>

        <div className="relative hidden min-h-[380px] bg-warm lg:block">
          <Image
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop"
            alt="Вкусные блюда"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-surface p-4 shadow-lg border">
            <div className="flex items-center gap-3">
              <div className="size-12 overflow-hidden rounded-xl bg-muted">
                <Image src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop" alt="" width={48} height={48} className="size-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Печкин Дом · 4.8 ★</span>
                <span className="text-xs text-muted-foreground">Выпечка · привезём за 25 мин</span>
              </div>
              <Link href="/catalog" className="ml-auto rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-11 inline-flex items-center justify-center">Меню</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
