// Чистая логика часов работы ресторана.
// Изоморфна (нет React/Next/DOM), поэтому используется и в server-, и в client-компонентах.
// Поддерживает расписания на 7 дней, ночные смены (close <= open => закрывается на следующий день)
// и поиск ближайшего открытия в пределах следующих 7 дней.

export type DaySchedule = {
  /** 0 = воскресенье, 1 = понедельник, ..., 6 = суббота — как у Date#getDay(). */
  dayOfWeek: number
  /** "HH:MM" в локальной таймзоне ресторана. */
  openTime: string
  /** "HH:MM". Если <= openTime — смена переходит через полночь. */
  closeTime: string
  /** День закрыт целиком (например, понедельник — выходной). */
  isClosed?: boolean
}

export type HoursInfo = {
  isOpen: boolean
  /** ISO начала текущей смены, если ресторан открыт. */
  openedAt?: string
  /** ISO конца текущей смены, если ресторан открыт. */
  closesAt?: string
  /** ISO начала ближайшей смены, если закрыт. undefined, если расписание не задано. */
  nextOpensAt?: string
  /** Готовая человекочитаемая подпись. */
  statusLabel: string
}

const MS_PER_MIN = 60_000
const MS_PER_DAY = 86_400_000

/** Парсит "HH:MM" в минуты от начала суток. Бросает, если формат неверный. */
export function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error(`Invalid time: ${t}`)
  }
  return h * 60 + m
}

function dayStart(d: Date): Date {
  const x = new Date(d.getTime())
  x.setHours(0, 0, 0, 0)
  return x
}

function minutesIntoDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * Возвращает ISO ближайшей минуты, когда ресторан откроется, в пределах 7 дней.
 * Если все дни closed или расписания нет — undefined.
 */
export function findNextOpen(
  schedule: DaySchedule[],
  now: Date,
  weekWindow = 7
): Date | undefined {
  if (!schedule.length) return undefined
  const todayStart = dayStart(now)
  const nowMin = minutesIntoDay(now)

  for (let dayOffset = 0; dayOffset < weekWindow; dayOffset++) {
    const dayDate = new Date(todayStart.getTime() + dayOffset * MS_PER_DAY)
    const dow = dayDate.getDay()
    const daySchedules = schedule.filter((s) => s.dayOfWeek === dow)
    for (const s of daySchedules) {
      if (s.isClosed) continue
      const openMin = parseTimeToMinutes(s.openTime)
      const candidate = new Date(dayDate.getTime() + openMin * MS_PER_MIN)
      // В текущий день: только будущие открытия.
      if (dayOffset === 0 && openMin <= nowMin) continue
      return candidate
    }
  }
  return undefined
}

/**
 * Текущая смена, в которой `now` лежит. Поддерживает ночные смены:
 * если close <= open, конец смены — на следующий день.
 */
export function findCurrentShift(
  schedule: DaySchedule[],
  now: Date
): { dayStart: Date; open: number; close: number } | undefined {
  if (!schedule.length) return undefined
  const todayStart = dayStart(now)
  const nowMin = minutesIntoDay(now)

  // Сначала проверяем «вчерашние» смены, которые могли перейти через полночь.
  const yesterday = new Date(todayStart.getTime() - MS_PER_DAY)
  const yesterdaySchedules = schedule.filter((s) => s.dayOfWeek === yesterday.getDay())
  for (const s of yesterdaySchedules) {
    if (s.isClosed) continue
    const open = parseTimeToMinutes(s.openTime)
    const close = parseTimeToMinutes(s.closeTime)
    if (close <= open) {
      // Закрывается сегодня (после полуночи), окно — [вчера open, сегодня close].
      if (nowMin < close) {
        return { dayStart: yesterday, open, close }
      }
    }
  }

  // Затем сегодняшние смены.
  const todaySchedules = schedule.filter((s) => s.dayOfWeek === todayStart.getDay())
  for (const s of todaySchedules) {
    if (s.isClosed) continue
    const open = parseTimeToMinutes(s.openTime)
    const close = parseTimeToMinutes(s.closeTime)
    if (close <= open) {
      // Ночная смена: окно — [сегодня open, завтра close).
      if (nowMin >= open) {
        return { dayStart: todayStart, open, close }
      }
    } else {
      if (nowMin >= open && nowMin < close) {
        return { dayStart: todayStart, open, close }
      }
    }
  }
  return undefined
}

/** Главная функция: текущее состояние + подпись для UI. */
export function getHoursInfo(schedule: DaySchedule[], now: Date = new Date()): HoursInfo {
  const current = findCurrentShift(schedule, now)
  if (current) {
    const openedAt = new Date(current.dayStart.getTime() + current.open * MS_PER_MIN)
    const closesAt = new Date(
      current.dayStart.getTime() + current.close * MS_PER_MIN + (current.close <= current.open ? MS_PER_DAY : 0)
    )
    const closeLabel = formatHHMM(closesAt)
    return {
      isOpen: true,
      openedAt: openedAt.toISOString(),
      closesAt: closesAt.toISOString(),
      statusLabel: `Открыто до ${closeLabel}`,
    }
  }

  const next = findNextOpen(schedule, now)
  if (!next) {
    return { isOpen: false, statusLabel: "Закрыто" }
  }
  const diffMs = next.getTime() - now.getTime()
  const minutes = Math.max(0, Math.round(diffMs / MS_PER_MIN))
  return {
    isOpen: false,
    nextOpensAt: next.toISOString(),
    statusLabel: `Закрыто · ${opensInLabel(next, now)}`,
  }
}

/** "через 2 ч 15 мин", "через 45 мин", "завтра в 10:00", "в пн в 10:00". */
export function opensInLabel(next: Date, now: Date): string {
  const todayStart = dayStart(now)
  const tomorrowStart = new Date(todayStart.getTime() + MS_PER_DAY)
  const diffMs = next.getTime() - now.getTime()
  const minutes = Math.max(0, Math.round(diffMs / MS_PER_MIN))

  const sameDay = next.getTime() < tomorrowStart.getTime()
  if (sameDay) {
    if (minutes < 60) return `откроется через ${minutes} мин`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (m === 0) return `откроется через ${h} ч`
    return `откроется через ${h} ч ${m} мин`
  }

  const nextDay = new Date(tomorrowStart.getTime() + MS_PER_DAY)
  const isDayAfterTomorrow = next.getTime() < nextDay.getTime()
  if (isDayAfterTomorrow) {
    return `завтра в ${formatHHMM(next)}`
  }
  return `в ${weekdayShort(next)} в ${formatHHMM(next)}`
}

/**
 * Короткая подпись времени открытия для кнопки/метки в карточке.
 * "в 12:00" / "завтра в 10:00" / "в пн в 10:00" / "через 45 мин".
 * Не дублирует полный overlay-статус, дополняет его конкретным временем.
 */
export function nextOpenShortLabel(next: Date, now: Date): string {
  const todayStart = dayStart(now)
  const tomorrowStart = new Date(todayStart.getTime() + MS_PER_DAY)
  const diffMs = next.getTime() - now.getTime()
  const minutes = Math.max(0, Math.round(diffMs / MS_PER_MIN))

  const sameDay = next.getTime() < tomorrowStart.getTime()
  if (sameDay) {
    if (minutes < 60) return `через ${minutes} мин`
    return `в ${formatHHMM(next)}`
  }

  const nextDay = new Date(tomorrowStart.getTime() + MS_PER_DAY)
  const isDayAfterTomorrow = next.getTime() < nextDay.getTime()
  if (isDayAfterTomorrow) {
    return `завтра в ${formatHHMM(next)}`
  }
  return `в ${weekdayShort(next)} в ${formatHHMM(next)}`
}

function formatHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

const WEEKDAYS_SHORT = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]
function weekdayShort(d: Date): string {
  return WEEKDAYS_SHORT[d.getDay()]!
}
