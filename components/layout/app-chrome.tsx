"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/shared/footer"
import { BottomNav } from "@/components/layout/bottom-nav"

const CHROMELESS_PREFIXES = ["/admin", "/restaurant-panel", "/courier"]

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isChromeless = React.useMemo(() => {
    if (!pathname) return false
    return CHROMELESS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  }, [pathname])

  if (isChromeless) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 w-full min-w-0 pb-[56px] lg:pb-0">
        {children}
      </main>
      <div className="mt-8 lg:mt-12">
        <Footer />
      </div>
      <BottomNav />
    </>
  )
}
