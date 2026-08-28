"use client"

import * as React from "react"
import { Search, RefreshCcw, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Chip } from "@/components/ui/chip"
import { Badge } from "@/components/ui/badge"
import { auditLogsMock, type AuditLogLevel, type AuditLogMock } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const LEVELS: { value: AuditLogLevel | "all"; label: string; variant: "default" | "success" | "warning" | "danger" | "muted" }[] = [
  { value: "all", label: "Все", variant: "default" },
  { value: "info", label: "info", variant: "muted" },
  { value: "success", label: "success", variant: "success" },
  { value: "warning", label: "warning", variant: "warning" },
  { value: "error", label: "error", variant: "danger" },
]

const PAGE_SIZE = 8

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "только что"
  if (min < 60) return `${min} мин назад`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} ч назад`
  const d = Math.floor(h / 24)
  return `${d} дн назад`
}

function levelVariant(level: AuditLogLevel): "success" | "warning" | "danger" | "muted" {
  switch (level) {
    case "success":
      return "success"
    case "warning":
      return "warning"
    case "error":
      return "danger"
    case "info":
    default:
      return "muted"
  }
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

export default function AdminLogsPage() {
  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [level, setLevel] = React.useState<AuditLogLevel | "all">("all")
  const [entity, setEntity] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<AuditLogMock | null>(null)
  const [items, setItems] = React.useState<AuditLogMock[]>(auditLogsMock)
  const [refreshing, setRefreshing] = React.useState(false)

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200)
    return () => clearTimeout(t)
  }, [query])

  // Build entity options from current dataset
  const entities = React.useMemo(() => {
    const list = unique(items.map((i) => i.entity)).sort()
    return ["all", ...list]
  }, [items])

  // Filtered + paginated
  const filtered = React.useMemo(() => {
    return items.filter((it) => {
      if (level !== "all" && it.level !== level) return false
      if (entity !== "all" && it.entity !== entity) return false
      if (debouncedQuery) {
        const haystack = [
          it.action,
          it.actorName,
          it.entity,
          it.entityId ?? "",
          it.ip ?? "",
          it.meta ? JSON.stringify(it.meta) : "",
        ]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(debouncedQuery)) return false
      }
      return true
    })
  }, [items, level, entity, debouncedQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = React.useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [level, entity, debouncedQuery])

  const refresh = React.useCallback(() => {
    setRefreshing(true)
    // Simulate fetch: shuffle the in-memory list and add a new system entry
    setTimeout(() => {
      const shuffled = [...auditLogsMock].sort(() => Math.random() - 0.5)
      const fresh: AuditLogMock = {
        id: `log_${Date.now()}`,
        createdAt: new Date().toISOString(),
        actorId: null,
        actorName: "system",
        action: "admin.logs.refresh",
        entity: "AuditLog",
        entityId: null,
        level: "info",
      }
      setItems([fresh, ...shuffled])
      setRefreshing(false)
      setSelected(null)
    }, 350)
  }, [])

  const clearFilters = () => {
    setQuery("")
    setLevel("all")
    setEntity("all")
  }

  const hasActiveFilters = debouncedQuery !== "" || level !== "all" || entity !== "all"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight">Логи</h1>
          <p className="text-sm text-muted-foreground">
            Аудит-журнал действий пользователей и системных событий
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCcw className={cn("size-4", refreshing && "animate-spin")} />
            {refreshing ? "Обновление…" : "Обновить"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по действию, актору, ID…"
                className="pl-9"
                aria-label="Поиск по логам"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
              {LEVELS.map((l) => (
                <Chip
                  key={l.value}
                  selected={level === l.value}
                  onClick={() => setLevel(l.value)}
                  aria-label={`Уровень ${l.label}`}
                >
                  {l.label}
                </Chip>
              ))}
            </div>
          </div>

          {entities.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Сущность:</span>
              <Chip selected={entity === "all"} onClick={() => setEntity("all")}>
                все
              </Chip>
              {entities.filter((e) => e !== "all").map((e) => (
                <Chip key={e} selected={entity === e} onClick={() => setEntity(e)}>
                  {e}
                </Chip>
              ))}
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span>
                Найдено: <strong className="text-foreground">{filtered.length}</strong>{" "}
                {filtered.length === 1 ? "запись" : filtered.length < 5 ? "записи" : "записей"}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium hover:bg-muted hover:text-foreground"
              >
                <X className="size-3" /> Сбросить
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-[120px_1fr_140px_140px_120px] border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="px-3 py-2">Уровень</div>
              <div className="px-3 py-2">Действие</div>
              <div className="px-3 py-2">Актор</div>
              <div className="px-3 py-2">Сущность</div>
              <div className="px-3 py-2">Когда</div>
            </div>

            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <p className="text-sm font-medium">Ничего не найдено</p>
                <p className="text-xs text-muted-foreground">Попробуйте сбросить фильтры или изменить запрос.</p>
                {hasActiveFilters && (
                  <Button size="sm" variant="outline" onClick={clearFilters}>
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y">
                {pageItems.map((it) => {
                  const isActive = selected?.id === it.id
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(isActive ? null : it)}
                        aria-pressed={isActive}
                        className={cn(
                          "grid w-full grid-cols-[120px_1fr_140px_140px_120px] items-center text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive ? "bg-primary/5" : "hover:bg-muted/40"
                        )}
                      >
                        <div className="px-3 py-2.5">
                          <Badge variant={levelVariant(it.level)}>{it.level}</Badge>
                        </div>
                        <div className="flex min-w-0 flex-col px-3 py-2.5">
                          <span className="truncate font-mono text-xs">{it.action}</span>
                          {it.entityId && (
                            <span className="truncate text-xs text-muted-foreground">
                              {it.entity}#{it.entityId}
                            </span>
                          )}
                        </div>
                        <div className="truncate px-3 py-2.5 text-xs text-muted-foreground">
                          {it.actorName}
                        </div>
                        <div className="px-3 py-2.5 text-xs">
                          <span className="rounded-md bg-muted px-1.5 py-0.5">{it.entity}</span>
                        </div>
                        <div className="px-3 py-2.5 text-xs text-muted-foreground">
                          <div>{formatDateTime(it.createdAt)}</div>
                          <div className="text-[11px]">{timeAgo(it.createdAt)}</div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="flex items-center justify-between border-t bg-card px-4 py-3">
              <span className="text-xs text-muted-foreground">
                Показано{" "}
                <strong className="text-foreground">
                  {pageItems.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
                  {(safePage - 1) * PAGE_SIZE + pageItems.length}
                </strong>{" "}
                из <strong className="text-foreground">{filtered.length}</strong>
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  aria-label="Предыдущая страница"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 text-xs tabular-nums">
                  {safePage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  aria-label="Следующая страница"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardContent className="flex flex-col gap-3 p-4">
            <h2 className="text-sm font-semibold">Детали</h2>
            {selected ? (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={levelVariant(selected.level)}>{selected.level}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Действие</p>
                  <p className="font-mono text-sm">{selected.action}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Актор</p>
                    <p className="text-sm">{selected.actorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Когда</p>
                    <p className="text-sm">{formatDateTime(selected.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Сущность</p>
                    <p className="text-sm">{selected.entity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="font-mono text-sm">{selected.entityId ?? "—"}</p>
                  </div>
                  {selected.ip && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">IP</p>
                      <p className="font-mono text-sm">{selected.ip}</p>
                    </div>
                  )}
                </div>
                {selected.meta && Object.keys(selected.meta).length > 0 && (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Метаданные</p>
                    <pre className="overflow-x-auto rounded-lg bg-muted p-2 font-mono text-xs">
                      {JSON.stringify(selected.meta, null, 2)}
                    </pre>
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
                  Закрыть
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Выберите запись из списка, чтобы увидеть подробности.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
