import type { Metadata } from "next"
import { CourierHeader } from "@/components/layout/courier-header"

export const metadata: Metadata = {
  title: "Кабинет курьера — ВкусоВоз",
}

export default function CourierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <CourierHeader />
      <main id="main-content" className="flex-1 min-w-0 bg-muted/30 p-4 lg:p-6">
        <div className="mx-auto w-full max-w-[1280px]">{children}</div>
      </main>
    </div>
  )
}
