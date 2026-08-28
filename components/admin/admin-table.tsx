"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  /** Класс для ячейки (например "w-24 tabular-nums"). */
  cellClassName?: string
  render: (row: T) => React.ReactNode
}

interface Props<T> {
  title: string
  rows: T[] | null
  columns: Column<T>[]
  page: number
  pages: number
  total: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  errorMessage?: string
  toolbar?: React.ReactNode
  emptyMessage?: string
}

export function AdminTable<T extends { id: string }>({
  title,
  rows,
  columns,
  page,
  pages,
  total,
  onPageChange,
  isLoading,
  errorMessage,
  toolbar,
  emptyMessage = "Записей пока нет",
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <h2 className="text-xs font-medium text-muted-foreground">{title}</h2>
        {toolbar}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "px-3 py-2 text-left text-xs font-medium text-muted-foreground",
                    c.cellClassName
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`s-${i}`} className="border-b last:border-b-0">
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-3">
                      <div className="h-3 w-full rounded bg-muted/60 motion-safe:animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!isLoading && errorMessage && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-destructive">
                  {errorMessage}
                </td>
              </tr>
            )}
            {!isLoading && !errorMessage && rows && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!isLoading && !errorMessage && rows && rows.length > 0 &&
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-3 py-2.5", c.cellClassName)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <span className="text-xs text-muted-foreground">
          Показано {rows?.length ?? 0} из {total}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-2 text-xs tabular-nums text-muted-foreground">
            {page} / {Math.max(1, pages)}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Следующая страница"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Хук для простых fetch'ей: paged + loading + error.
 * Принимает URL-билдер, чтобы разные таблицы использовали разные query.
 */
export function usePagedResource<T>(urlBuilder: (page: number) => string) {
  const [page, setPage] = React.useState(1)
  const [data, setData] = React.useState<{ items: T[]; total: number; pages: number } | null>(null)
  const [isLoading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | undefined>(undefined)

  const reload = React.useCallback(async (targetPage: number) => {
    setLoading(true)
    setError(undefined)
    try {
      const res = await fetch(urlBuilder(targetPage), { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? `Ошибка ${res.status}`)
        setData(null)
        return
      }
      setData({ items: json.data.items, total: json.data.total, pages: json.data.pages })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Сетевая ошибка")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [urlBuilder])

  React.useEffect(() => {
    void reload(page)
  }, [page, reload])

  return {
    page,
    setPage,
    items: data?.items ?? null,
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    isLoading,
    error,
    reload: () => reload(page),
  }
}
