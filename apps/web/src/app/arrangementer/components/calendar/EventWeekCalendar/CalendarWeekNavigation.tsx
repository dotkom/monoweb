"use client"

import { cn } from "@dotkomonline/ui"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { setISOWeek, setISOWeekYear, addWeeks, subWeeks, getISOWeek, getISOWeekYear } from "date-fns"
import type { FC } from "react"

interface WeekNavigationProps {
  year: number
  weekNumber: number
  onNavigate: (year: number, weekNumber: number) => void
  className?: string
}

export const CalendarWeekNavigation: FC<WeekNavigationProps> = ({ year, weekNumber, onNavigate, className }) => {
  let weekDate = new Date()

  const handlePreviousWeek = () => {
    weekDate = setISOWeekYear(weekDate, year)
    weekDate = setISOWeek(weekDate, weekNumber)

    const previousWeekDate = subWeeks(weekDate, 1)

    const newWeekNumber = getISOWeek(previousWeekDate)
    const newYear = getISOWeekYear(previousWeekDate)

    onNavigate(newYear, newWeekNumber)
  }

  const handleNextWeek = () => {
    let weekDate = new Date()
    weekDate = setISOWeekYear(weekDate, year)
    weekDate = setISOWeek(weekDate, weekNumber)

    const nextWeekDate = addWeeks(weekDate, 1)

    const newWeekNumber = getISOWeek(nextWeekDate)
    const newYear = getISOWeekYear(nextWeekDate)

    onNavigate(newYear, newWeekNumber)
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <h2 className="text-xl">
        Uke {weekNumber}, {year}
      </h2>
      <div className="flex gap-2 sm:gap-0">
        <button
          type="button"
          className="rounded-full hover:bg-gray-200 dark:hover:bg-stone-700 flex p-3 sm:p-2 duration-200"
          onClick={handlePreviousWeek}
          aria-label="Forrige uke"
        >
          <IconChevronLeft width={24} height={24} />
        </button>
        <button
          type="button"
          className="rounded-full hover:bg-gray-200 dark:hover:bg-stone-700 flex p-3 sm:p-2 duration-200"
          onClick={handleNextWeek}
          aria-label="Neste uke"
        >
          <IconChevronRight width={24} height={24} />
        </button>
      </div>
    </div>
  )
}
