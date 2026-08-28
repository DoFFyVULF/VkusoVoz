"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type DeliveryMode = "delivery" | "pickup"

type DeliveryState = {
  mode: DeliveryMode
  setMode: (mode: DeliveryMode) => void
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      mode: "delivery",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "vkusovoz:delivery",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
    }
  )
)
