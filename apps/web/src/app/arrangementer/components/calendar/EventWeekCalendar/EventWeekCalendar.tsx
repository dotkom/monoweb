"use client"

import { useEventAllSummariesQuery } from "@/app/arrangementer/components/queries"
import { TZDate } from "@date-fns/tz"
import { useSession } from "@dotkomonline/oauth2/react"
import type { EventWithAttendanceSummary } from "@dotkomonline/types"
import { cn } from "@dotkomonline/ui"
import { IconLoader2 } from "@tabler/icons-react"
import { endOfISOWeek, setISOWeek, setISOWeekYear, startOfISOWeek, subDays } from "date-fns"
import type { FC } from "react"
import { EventCalendarItem } from "../EventCalendarItem"
import { eventCategories } from "../eventTypeConfig"
import { getWeekCalendarArray } from "./getWeekCalendarArray"

function getEventTypeGuide(events: EventWithAttendanceSummary[]) {
  const presentTypes = new Set(events.map((event) => event.event.type))

  return Array.from(presentTypes)
    .filter((type) => eventCategories[type])
    .map((type) => ({
      type,
      ...eventCategories[type],
    }))
}

interface WeekCalendarProps {
  year: number
  weekNumber: number
}

export const EventWeekCalendar: FC<WeekCalendarProps> = ({ year, weekNumber }) => {
  let weekDate = new Date()
  weekDate = setISOWeekYear(weekDate, year)
  weekDate = setISOWeek(weekDate, weekNumber)

  const weekStart = startOfISOWeek(weekDate)
  const weekEnd = endOfISOWeek(weekDate)

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllSummariesQuery({
    filter: {
      byStartDate: {
        // 3 day buffer in case of long events that are in the week but start way sooner
        min: new TZDate(subDays(weekStart, 3)),
        max: new TZDate(weekEnd),
      },
      orderBy: "asc",
    },
    page: {
      take: 1000,
    },
  })

  const eventDetails = futureEventWithAttendances

  const weekData = getWeekCalendarArray(year, weekNumber, eventDetails)
  const eventTypeGuideItems = getEventTypeGuide(eventDetails)

  const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"]

  const nowDate = new Date()
  nowDate.setHours(0, 0, 0, 0)

  return (
    <div className="relative">
      {isLoading && (
        <div className="z-50 absolute flex justify-center w-full h-full">
          <IconLoader2 className="gray-800 dark:stone-200 animate-spin absolute top-16" width={40} height={40} />
        </div>
      )}
      <div className="grid grid-cols-7 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr]">
        {weekdays.map((day) => (
          <div
            key={day}
            className={`text-center sm:text-start sm:pl-3 leading-5
              ${
                (nowDate.getDay() === 0 ? 6 : nowDate.getDay() - 1) === weekdays.indexOf(day)
                  ? "font-semibold text-sm"
                  : "text-gray-600 dark:text-stone-400 text-xs"
              }`}
          >
            <span className="sm:hidden">{day[0]}</span>
            <span className="hidden sm:block">{day}</span>
          </div>
        ))}
      </div>

      <div className="relative min-h-40">
        <div className="grid grid-cols-7 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] bottom-0 top-0 absolute w-full h-full">
          {weekData.dates.map((day) => (
            <div
              key={new Date(day).toISOString()}
              className={cn(
                "py-1 pr-1 relative flex flex-col items-center sm:items-end border-t sm:border-t-0 border-gray-200 dark:border-stone-700",
                weekData.dates.indexOf(day) % 7 === 0 ? "" : "pl-1 sm:border-l"
              )}
            >
              <span
                className={cn(
                  "text-sm w-7 h-7 leading-7 text-center",
                  "text-gray-600 dark:text-stone-400",
                  new Date(day).getTime() === nowDate.getTime()
                    ? "font-semibold rounded-full bg-red-600 text-white dark:text-white"
                    : ""
                )}
              >
                {new Date(day).getDate()}
              </span>
            </div>
          ))}
        </div>

        <div className="relative pt-10 pb-1">
          {weekData.eventDetails.map((row, rowIndex) => (
            <div
              className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
              key={`week-${weekNumber}-row-${rowIndex}-${year}`}
            >
              {row.map((eventWithAttendance) => {
                const { eventDisplayProps, ...eventDetail } = eventWithAttendance
                return (
                  <EventCalendarItem
                    key={eventDetail.event.id}
                    eventDetail={eventDetail}
                    eventDisplayProps={eventDisplayProps}
                    className="my-1"
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {eventTypeGuideItems.length > 0 && (
        <div className="flex gap-y-2 gap-x-4 text-sm p-2 flex-wrap">
          {eventTypeGuideItems.map(({ type, classes, displayName }) => (
            <span key={type} className="flex items-center">
              <span className={cn("size-3 rounded-full mr-1", classes.guide)} />
              {displayName}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
