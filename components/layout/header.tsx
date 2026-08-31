"use client"

import * as React from "react"
import Link from "next/link"
import { UtensilsCrossed, MapPin, Heart, ShoppingBag, ChevronDown } from "lucide-react"
import { useCartStore } from "@/lib/store/cart"
import { SearchDropdown } from "@/components/search/search-dropdown"
import { DeliveryToggle } from "@/components/ui/delivery-toggle"
import { AddressPicker } from "@/components/address/address-picker"
import { useAddressStore } from "@/lib/store/address"
import { UserMenu } from "@/components/layout/user-menu"
import Image from "next/image"

export function Header() {
  const count = useCartStore((s) => s.totalQuantity())
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const cartCount = mounted ? count : 0
  const address = useAddressStore((s) => s.address)

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 lg:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="ВкусоВоз — на главную"
        >
          <Image
            src="/logo.png"
            alt="ВкусоВоз"
            width={52}
            height={52}
            priority
            className="h-9 w-9 shrink-0 rounded-xl object-cover sm:h-11 sm:w-11"
          />
          <span className="font-heading text-[18px] font-bold tracking-tight leading-none whitespace-nowrap sm:text-[20px]">
            ВкусоВоз
          </span>
        </Link>

        <div className="hidden sm:flex shrink-0">
          <DeliveryToggle />
        </div>

        <AddressPicker>
          <button
            type="button"
            aria-label="Выбрать адрес доставки"
            className="hidden min-h-11 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex max-w-[260px]"
          >
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="flex flex-col overflow-hidden">
              {address ? (
                <>
                  <span className="truncate text-sm font-medium leading-none">{`${address.street}, ${address.house}`}</span>
                  <span className="truncate text-xs text-muted-foreground">{address.city}</span>
                </>
              ) : (
                <>
                  <span className="truncate text-sm font-medium leading-none">Укажите адрес</span>
                  <span className="truncate text-xs text-muted-foreground">Куда доставить?</span>
                </>
              )}
            </span>
            <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </AddressPicker>

        <div className="hidden flex-1 items-center lg:flex max-w-[420px]">
          <SearchDropdown placeholder="Найти блюдо или ресторан" className="max-w-[420px]" />
        </div>

        <div className="ml-auto flex items-center gap-1 shrink-0">
          <Link
            href="/account/favorites"
            aria-label="Избранное"
            className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Heart className="size-5" aria-hidden="true" />
          </Link>
          <UserMenu />
          <Link
            href="/cart"
            aria-label={`Корзина, товаров: ${cartCount}`}
            className="relative inline-flex size-11 items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="absolute -right-1 -top-1 flex min-w-5 size-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-primary-foreground tabular-nums shadow-sm animate-in fade-in zoom-in-95"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-t border-border bg-surface px-3 py-2 sm:gap-2 sm:px-4 lg:hidden min-w-0">
        <AddressPicker>
          <button
            type="button"
            aria-label="Выбрать адрес"
            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-background border border-input px-2.5 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-11 sm:gap-2 sm:px-3"
          >
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium sm:text-sm">
              {address ? `${address.street}, ${address.house}` : "Укажите адрес"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </AddressPicker>
        <DeliveryToggle size="sm" className="shrink-0" />
      </div>
    </header>
  )
}
