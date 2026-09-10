"use client"

import { Text, cn } from "@dotkomonline/ui"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { IconArrowRight, IconCalendarEvent } from "@tabler/icons-react"
import { differenceInDays, formatDate, isPast, isSameDay, isSameYear, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"

interface EventListItemDateAndTimeProps {
  start: Date
  end: Date
  compact?: boolean
}

export const DateAndTime: FC<EventListItemDateAndTimeProps> = ({ start, end, compact = false }) => {
  const withinAWeek = Math.abs(differenceInDays(start, new Date())) < 7
  const excludeYear = isSameYear(start, end) && isThisYear(start)
  const past = isPast(end)
  const showTime = withinAWeek && !past
  const singleDay = isSameDay(start, end)
  const ongoing = isPast(start) && !past

  const startDate = formatDate(start, excludeYear ? "dd. MMM" : "dd.MM.yyyy", { locale: nb })
  const endDate = formatDate(end, excludeYear ? "dd. MMM" : "dd.MM.yyyy", { locale: nb })
  const startTime = formatDate(start, "HH:mm", { locale: nb })
  const endTime = formatDate(end, "HH:mm", { locale: nb })

  const startDateWithWeekday = capitalizeFirstLetter(
    formatDate(start, excludeYear ? "EEE dd. MMM" : "dd.MM.yyyy", { locale: nb })
  )

  const pastClassName = past
    ? "text-gray-600 dark:text-stone-600 group-hover:text-gray-800 dark:group-hover:text-stone-400"
    : undefined
  const calendarIconClassName = cn("shrink-0", !past && "text-gray-800 dark:text-stone-400")
  const arrowIconClassName = cn("shrink-0", !past && "text-gray-800 dark:text-stone-300")

  if (compact) {
    let compactLabel = startDate

    if (ongoing) {
      compactLabel = "Pågår nå"
    } else if (singleDay && showTime) {
      compactLabel = `${startDate} ${startTime} - ${endTime}`
    } else if (singleDay) {
      compactLabel = startDate
    } else if (showTime) {
      compactLabel = `${startDate} kl. ${startTime} – ${endDate} kl. ${endTime}`
    } else {
      compactLabel = `${startDate} – ${endDate}`
    }

    return (
      <div className={cn("flex min-w-0 flex-row items-center gap-2 text-xs dark:text-stone-300", pastClassName)}>
        <IconCalendarEvent className={cn("size-3.5", calendarIconClassName)} />
        <Text className="min-w-0 truncate">{compactLabel}</Text>
      </div>
    )
  }

  if (singleDay || ongoing) {
    return (
      <div className={cn("flex flex-row items-center gap-2 text-xs md:text-sm dark:text-stone-300", pastClassName)}>
        <IconCalendarEvent width={16} height={16} className={calendarIconClassName} />

        {ongoing ? (
          <Text>Pågår nå</Text>
        ) : (
          <div className="flex flex-col md:flex-row md:gap-1">
            <Text>{startDateWithWeekday}</Text>

            {showTime && (
              <Text>
                {startTime} - {endTime}
              </Text>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-row items-center gap-2 text-xs md:text-sm dark:text-stone-300", pastClassName)}>
      <IconCalendarEvent width={16} height={16} className={calendarIconClassName} />

      <div className="flex flex-col md:flex-row md:gap-1">
        <Text>{startDate}</Text>
        {showTime && <Text> kl. {startTime}</Text>}
      </div>

      <IconArrowRight width={16} height={16} className={arrowIconClassName} />

      <div className="flex flex-col md:flex-row md:gap-1">
        <Text>{endDate}</Text>
        {showTime && <Text>kl. {endTime}</Text>}
      </div>
    </div>
  )
}
