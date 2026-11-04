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
    <div className={cn("flex items-center gap-1", className)}>
      <Title className="text-lg font-medium max-sm:order-2 max-md:grow max-sm:text-center sm:mr-3">
        Uke {weekNumber}, {year}
      </Title>
      <Button
        size="icon-xl"
        variant="outline"
        onClick={handlePreviousWeek}
        aria-label="Forrige uke"
        className="max-sm:order-1"
      >
        <IconChevronLeft />
      </Button>
      <Button
        size="icon-xl"
        variant="outline"
        onClick={handleNextWeek}
        aria-label="Neste uke"
        className="max-sm:order-3"
      >
        <IconChevronRight />
      </Button>
    </div>
  )
}
