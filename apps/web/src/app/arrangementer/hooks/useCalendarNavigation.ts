"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUTC } from "@dotkomonline/utils"

export const useCalendarNavigation = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const now = getCurrentUTC()
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth() // 0-based

  const yParam = searchParams.get("y")
  const mParam = searchParams.get("m")

  const year = yParam ? Number(yParam) : currentYear
  // convert to 0-based month
  const month = mParam ? Number(mParam) - 1 : currentMonth

  const isCurrentMonth = year === currentYear && month === currentMonth

  const navigate = useCallback(
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

  return {
    year,
    month,
    isCurrentMonth,
    navigate,
  }
}
