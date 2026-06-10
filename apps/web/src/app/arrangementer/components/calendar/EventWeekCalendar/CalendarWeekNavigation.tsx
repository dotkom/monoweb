"use client"

import { Button, cn, Title } from "@dotkomonline/ui"
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
      <Title className="text-lg font-medium">
        Uke {weekNumber}, {year}
      </Title>
      <div className="flex gap-2 sm:gap-1">
        <Button className="p-1 aspect-square" onClick={handlePreviousWeek} aria-label="Forrige uke">
          <IconChevronLeft className="size-5" />
        </Button>
        <Button className="p-1 aspect-square" onClick={handleNextWeek} aria-label="Neste uke">
          <IconChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  )
}
