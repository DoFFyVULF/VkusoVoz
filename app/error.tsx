"use client"

import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-6 px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-8" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Что-то пошло не так</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Не удалось загрузить страницу. Проверьте интернет-соединение и попробуйте ещё раз. Если ошибка повторяется — свяжитесь с поддержкой.
        </p>
        {error.digest && <p className="text-xs text-muted-foreground">Код: {error.digest}</p>}
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Попробовать снова</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          На главную
        </Button>
      </div>
    </div>
  )
}
