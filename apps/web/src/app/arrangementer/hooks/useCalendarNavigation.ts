"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUTC } from "@dotkomonline/utils"

export const useCalendarNavigation = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const now = getCurrentUTC()
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth()

  const yearParam = Number(searchParams.get("y"))
  const monthParam = Number(searchParams.get("m"))

  const year = Number.isFinite(yearParam) ? yearParam : currentYear

  const month = Number.isFinite(monthParam)
    ? monthParam - 1 // convert 0-based month
    : currentMonth

  const isCurrentMonth = year === currentYear && month === currentMonth

  const navigate = useCallback(
    (nextYear: number, nextMonth: number) => {
      if (!Number.isFinite(nextYear) || !Number.isFinite(nextMonth)) {
        return
      }

      const params = new URLSearchParams(searchParams.toString())
      params.set("y", nextYear.toString())
      // convert to 1-based month
      params.set("m", (nextMonth + 1).toString())

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    year,
    month,
    isCurrentMonth,
    navigate,
  }
}
