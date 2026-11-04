"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUTC } from "@dotkomonline/utils"
import { getWeek } from "date-fns"

export const useCalendarNavigation = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const now = getCurrentUTC()
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth() // 0-based
  const currentWeek = getWeek(now, { weekStartsOn: 1 })

  const yParam = searchParams.get("y")
  const mParam = searchParams.get("m")
  const weekParam = searchParams.get("week")

  const year = yParam ? Number(yParam) : currentYear
  // convert to 0-based month
  const month = mParam ? Number(mParam) - 1 : currentMonth
  const week = weekParam ? Number(weekParam) : currentWeek

  const isCurrentMonth = year === currentYear && month === currentMonth
  const isCurrentWeek = year === currentYear && week === currentWeek

  const navigateMonth = useCallback(
    (nextYear: number, nextMonth: number) => {
      if (!Number.isFinite(nextYear) || !Number.isFinite(nextMonth)) {
        return
      }

      const params = new URLSearchParams(searchParams.toString())
      params.set("y", nextYear.toString())
      params.set("m", (nextMonth + 1).toString()) // convert back to 1-based

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const navigateWeek = useCallback(
    (nextYear: number, nextWeek: number) => {
      if (!Number.isFinite(nextWeek)) {
        return
      }

      const params = new URLSearchParams(searchParams.toString())
      params.set("y", nextYear.toString())
      params.set("week", nextWeek.toString())

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    year,
    month,
    isCurrentMonth,
    navigateMonth,
    week,
    isCurrentWeek,
    navigateWeek,
  }
}
