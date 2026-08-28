import Link from "next/link"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-6 px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-warm border text-primary">
        <SearchX className="size-8" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Страница не найдена</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Похоже, вы перешли по неверной ссылке или страница была перемещена. Проверьте адрес или вернитесь на главную.
        </p>
        <p className="text-3xl font-bold tracking-tight text-primary">404</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          На главную
        </Link>
        <Link href="/catalog" className="inline-flex h-11 items-center justify-center rounded-xl border bg-background px-6 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Перейти в каталог
        </Link>
      </div>
    </div>
  )
}
