"use client"

import { Button, cn, Title } from "@dotkomonline/ui"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import type { FC } from "react"

interface CalendarNavigationProps {
  year: number
  month: number
  onNavigate: (year: number, month: number) => void
  className?: string
}

const months = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export const CalendarMonthNavigation: FC<CalendarNavigationProps> = ({ year, month, onNavigate, className }) => {
  const handlePreviousMonth = () => {
    if (month === 0) {
      onNavigate(year - 1, 11)
    } else {
      onNavigate(year, month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      onNavigate(year + 1, 0)
    } else {
      onNavigate(year, month + 1)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Title className="text-lg font-medium max-sm:order-2 max-md:grow max-sm:text-center sm:mr-3">
        {months[month]} {year}
      </Title>
      <Button
        size="icon-xl"
        variant="outline"
        onClick={handlePreviousMonth}
        aria-label="Forrige måned"
        className="max-sm:order-1"
      >
        <IconChevronLeft />
      </Button>
      <Button
        size="icon-xl"
        variant="outline"
        onClick={handleNextMonth}
        aria-label="Neste måned"
        className="max-sm:order-3"
      >
        <IconChevronRight />
      </Button>
    </div>
  )
}
