"use client"

import { formatCompactTimeUntil } from "./formatCompactTimeUntil"
import { useCountdown } from "./use-countdown"

export function useCompactCountdown(date: Date): string | null {
  return useCountdown(date, () => formatCompactTimeUntil(date))
}
