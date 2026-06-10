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
    <div className={cn("flex items-center gap-4", className)}>
      <Title className="text-lg font-medium">
        {months[month]} {year}
      </Title>
      <div className="flex gap-2 sm:gap-1">
        <Button onClick={handlePreviousMonth} aria-label="Forrige måned" className="p-1 aspect-square">
          <IconChevronLeft className="size-5" />
        </Button>
        <Button onClick={handleNextMonth} aria-label="Neste måned" className="p-1 aspect-square">
          <IconChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  )
}
