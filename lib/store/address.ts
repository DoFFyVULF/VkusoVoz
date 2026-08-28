"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type Address = {
  city: string
  street: string
  house: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  comment?: string
  label?: string
}

type AddressState = {
  address: Address | null
  setAddress: (address: Address) => void
  clearAddress: () => void
}

export function formatAddress(address: Address | null): string {
  if (!address) return ""
  const base = `${address.city}, ${address.street}, ${address.house}`
  const extra: string[] = []
  if (address.apartment) extra.push(`кв. ${address.apartment}`)
  if (address.entrance) extra.push(`подъезд ${address.entrance}`)
  if (address.floor) extra.push(`этаж ${address.floor}`)
  if (address.intercom) extra.push(`домофон ${address.intercom}`)
  const suffix = extra.length ? `, ${extra.join(", ")}` : ""
  const comment = address.comment ? ` (${address.comment})` : ""
  return `${base}${suffix}${comment}`
}

export function formatAddressShort(address: Address | null): string {
  if (!address) return ""
  return `${address.street}, ${address.house}`
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      address: null,
      setAddress: (address) => set({ address }),
      clearAddress: () => set({ address: null }),
    }),
    {
      name: "vkusovoz:address",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
    }
  )
)
