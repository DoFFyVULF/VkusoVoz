"use client"

import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAddress, type Address } from "@/lib/store/address"

type AddressDisplayProps = {
  address: Address | null
  placeholderTitle?: string
  placeholderSubtitle?: string
  className?: string
  compact?: boolean
}

export function AddressDisplay({ address, placeholderTitle = "Укажите адрес", placeholderSubtitle = "Куда доставить?", className, compact }: AddressDisplayProps) {
  if (!address) {
    return (
      <span className={cn("flex flex-col overflow-hidden text-left", className)}>
        <span className={cn(compact ? "text-sm font-medium leading-none truncate" : "truncate text-sm font-medium leading-none")}>{placeholderTitle}</span>
        <span className={cn(compact ? "truncate text-xs text-muted-foreground" : "truncate text-xs text-muted-foreground")}>{placeholderSubtitle}</span>
      </span>
    )
  }
  return (
    <span className={cn("flex flex-col overflow-hidden text-left", className)}>
      <span className="truncate text-sm font-medium leading-none">{`${address.street}, ${address.house}`}</span>
      <span className="truncate text-xs text-muted-foreground">{address.city}{address.apartment ? `, кв. ${address.apartment}` : ""}</span>
    </span>
  )
}

export function formatAddressHelper(address: Address | null) {
  return formatAddress(address)
}
