/**
 * Returns the end-of-month target date for the countdown.
 * Always points to 23:59:59 on the last day of the current month.
 * Once that passes, it automatically rolls over to the next month's last day.
 */
export function getMonthEndTarget(): Date {
  const now = new Date()
  // last day of current month at 23:59:59
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // if we've already passed it, roll to end of next month
  if (now >= target) {
    return new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59)
  }

  return target
}

export interface TimeLeft {
  d: string
  h: string
  m: string
  s: string
}

export function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    d: String(Math.floor(diff / 86_400_000)).padStart(2, '0'),
    h: String(Math.floor((diff / 3_600_000) % 24)).padStart(2, '0'),
    m: String(Math.floor((diff / 60_000) % 60)).padStart(2, '0'),
    s: String(Math.floor((diff / 1_000) % 60)).padStart(2, '0'),
  }
}
