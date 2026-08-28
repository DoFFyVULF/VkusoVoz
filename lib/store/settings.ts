"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { adminSettingsDefault, type AdminSettingsMock } from "@/lib/mock-data"

type SettingsState = {
  settings: AdminSettingsMock
  hydrated: boolean
  setSettings: (next: AdminSettingsMock) => void
  patchSettings: (patch: Partial<AdminSettingsMock>) => void
  reset: () => void
  setHydrated: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: adminSettingsDefault,
      hydrated: false,
      setSettings: (next) => set({ settings: next }),
      patchSettings: (patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            ...patch,
            general: { ...s.settings.general, ...(patch.general ?? {}) },
            orders: { ...s.settings.orders, ...(patch.orders ?? {}) },
            delivery: { ...s.settings.delivery, ...(patch.delivery ?? {}) },
            notifications: {
              ...s.settings.notifications,
              ...(patch.notifications ?? {}),
            },
            maintenance: { ...s.settings.maintenance, ...(patch.maintenance ?? {}) },
          },
        })),
      reset: () => set({ settings: adminSettingsDefault }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "vkusovoz:admin-settings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage)
      ),
      partialize: (s) => ({ settings: s.settings }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

export function useSettings() {
  const settings = useSettingsStore((s) => s.settings)
  const hydrated = useSettingsStore((s) => s.hydrated)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const reset = useSettingsStore((s) => s.reset)
  return { settings, hydrated, setSettings, reset }
}
