"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Chip } from "@/components/ui/chip"

export function QuickCategories({ categories }: { categories: readonly string[] }) {
  const router = useRouter()
  const [active, setActive] = React.useState<string | null>(null)

  const handleClick = (c: string) => {
    setActive((prev) => (prev === c ? null : c))
    router.push(`/catalog?cat=${encodeURIComponent(c)}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0" role="list">
      {categories.map((c) => (
        <Chip key={c} className="shrink-0" selected={active === c} onClick={() => handleClick(c)}>
          {c}
        </Chip>
      ))}
    </div>
  )
}
