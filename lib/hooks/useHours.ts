"use client"

import * as React from "react"
import { getHoursInfo, type DaySchedule, type HoursInfo } from "@/lib/restaurant-hours"

/**
 * Возвращает текущее состояние часов работы и обновляет его каждую минуту.
 * На сервере отдаёт «как есть» — без тиков. Используется только в client-компонентах,
 * где важно, чтобы «откроется через 2 ч 15 мин» обновлялось без перезагрузки страницы.
 */
export function useHours(schedule: DaySchedule[]): HoursInfo {
  // Чтобы SSR и первый клиентский рендер совпадали, фиксируем now = null
  // до монтирования — реальное время подставляется в useEffect.
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  return React.useMemo(
    () => (now ? getHoursInfo(schedule, now) : { isOpen: false, statusLabel: "" }),
    [schedule, now]
  )
}
