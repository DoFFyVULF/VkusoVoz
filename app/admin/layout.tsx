import * as React from "react"
import type { Metadata } from "next"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export const metadata: Metadata = {
  title: "Админ-панель — ВкусоВоз",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <React.Suspense fallback={<div className="h-14 border-b bg-card" />}>
        <AdminHeader />
      </React.Suspense>
      <div className="flex flex-1 min-w-0">
        <React.Suspense fallback={<aside className="hidden w-[220px] shrink-0 border-r bg-surface lg:block" />}>
          <AdminSidebar />
        </React.Suspense>
        <main id="main-content" className="flex-1 min-w-0 bg-muted/30 p-4 lg:p-6">
          <React.Suspense fallback={null}>{children}</React.Suspense>
        </main>
      </div>
    </div>
  )
}
