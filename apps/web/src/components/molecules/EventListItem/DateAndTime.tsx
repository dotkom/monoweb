"use client"

import { Icon, Text, cn } from "@dotkomonline/ui"
import { differenceInDays, formatDate, isPast, isSameDay, isSameYear, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"

interface EventListItemDateAndTimeProps {
  start: Date
  end: Date
}

export const DateAndTime: FC<EventListItemDateAndTimeProps> = ({ start, end }) => {
  const withinAWeek = Math.abs(differenceInDays(start, new Date())) < 7
  const excludeYear = isSameYear(start, end) && isThisYear(start)
  const past = isPast(end)

  const singleDay = isSameDay(start, end)
  const showTime = withinAWeek && !past
  const startDate = formatDate(start, excludeYear ? "dd. MMM" : "dd.MM.yyyy", { locale: nb })
  const endDate = formatDate(end, excludeYear ? "dd. MMM" : "dd.MM.yyyy", { locale: nb })
  const startTime = formatDate(start, "HH:mm", { locale: nb })
  const endTime = formatDate(end, "HH:mm", { locale: nb })
  const ongoing = isPast(start) && !past

  if (singleDay || ongoing) {
    return (
      <div
        className={cn(
          "flex flex-row gap-2 items-center dark:text-stone-400",
          "text-xs md:text-sm",
          past && "text-gray-600 dark:text-stone-700 group-hover:text-gray-800 dark:group-hover:text-stone-500"
        )}
      >
        <Icon
          icon="tabler:calendar-event"
          className={cn("text-sm md:text-base", !past && "text-gray-800 dark:text-stone-500")}
        />

        {ongoing ? (
          <Text>Pågår nå</Text>
        ) : (
          <div className="flex flex-col md:flex-row md:gap-1">
            <Text>{startDate}</Text>

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
    <div
      className={cn(
        "flex flex-row gap-2 items-center dark:text-stone-400",
        "text-xs md:text-sm",
        past && "text-gray-600 group-hover:text-gray-800 dark:text-stone-700 dark:group-hover:text-stone-500"
      )}
    >
      <Icon
        icon="tabler:calendar-event"
        className={cn("text-sm md:text-base", !past && "text-gray-800 dark:text-stone-500")}
      />

      <div className="flex flex-col md:flex-row md:gap-1">
        <Text>{startDate}</Text>
        {showTime && <Text> kl. {startTime}</Text>}
      </div>

      <Icon
        icon="tabler:arrow-right"
        className={cn("text-sm md:text-base", !past && "text-gray-800 dark:text-stone-400")}
      />

      <div className="flex flex-col md:flex-row md:gap-1">
        <Text>{endDate}</Text>
        {showTime && <Text>kl. {endTime}</Text>}
      </div>
    </div>
  )
}
