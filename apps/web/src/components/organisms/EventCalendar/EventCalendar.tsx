"use client"

import { useEventAllQuery } from "@/app/arrangementer/components/queries"
import { TZDate } from "@date-fns/tz"
import { useSession } from "@dotkomonline/oauth2/react"
import type { EventWithAttendance } from "@dotkomonline/types"
import { Icon, cn } from "@dotkomonline/ui"
import { endOfMonth, endOfWeek, getWeek, isThisWeek } from "date-fns"
import type { FC } from "react"
import { EventCalendarItem } from "./EventCalendarItem"
import { eventCategories } from "./eventTypeConfig"
import { getCalendarArray } from "./getCalendarArray"

function getEventTypeGuide(events: EventWithAttendance[]) {
  const presentTypes = new Set(events.map((event) => event.event.type))

  return Array.from(presentTypes)
    .filter((type) => eventCategories[type as keyof typeof eventCategories])
    .map((type) => ({
      type,
      ...eventCategories[type as keyof typeof eventCategories],
    }))
}

interface CalendarProps {
  year: number
  month: number
}

export const EventCalendar: FC<CalendarProps> = ({ year, month }) => {
  const session = useSession()

  // fetch 10 days prior to first day of month as a buffer since fliter is by start date
  const calendarStart = new TZDate(year, month, 1 - 10)
  const lastDayOfMonth = endOfMonth(new TZDate(year, month, 1))
  const calendarEnd = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 })

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllQuery({
    filter: {
      byStartDate: {
        min: calendarStart,
        max: calendarEnd,
      },
      orderBy: "asc",
    },
    page: {
      take: 1000,
    },
  })

  const eventDetails = futureEventWithAttendances
  const userId = session?.sub

  const cal = getCalendarArray(year, month, eventDetails)
  const eventTypeGuideItems = getEventTypeGuide(eventDetails)

  const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"]

  const nowDate = new Date()
  nowDate.setHours(0, 0, 0, 0)

  return (
    <div className="relative">
      {isLoading && (
        <div className="z-50 absolute flex justify-center w-full h-full">
          <Icon className="animate-spin absolute top-40" icon="tabler:loader-2" width={40} height={40} />
        </div>
      )}
      <div className="grid grid-cols-7 sm:grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr]">
        <div className="hidden sm:block w-6 pr-2 text-gray-600 dark:text-stone-400 text-xs leading-5">Uke</div>
        {weekdays.map((day) => (
          <div
            key={day}
            className={`text-center sm:text-end sm:pr-3 leading-5
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

      {cal.weeks.map((week, weekIndex) => (
        <div className="relative min-h-24 sm:min-h-28" key={`week-${getWeek(week.dates[1])}-${cal.year}-${cal.month}`}>
          <div className="grid grid-cols-7 sm:grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] bottom-0 top-0 absolute w-full h-full">
            <div
              className={cn(
                "hidden sm:flex w-6 pr-2 items-center justify-center",
                isThisWeek(week.dates[1]) ? "font-semibold text-sm" : "text-gray-600 dark:text-stone-400 text-xs"
              )}
            >
              {getWeek(week.dates[1])}
            </div>
            {week.dates.map((day) => (
              <div
                key={new Date(day).toISOString()}
                className={cn(
                  "py-1 pr-1 relative flex flex-col items-center sm:items-end border-gray-300 dark:border-stone-600 border-t-[1px] ",
                  week.dates.indexOf(day) % 7 === 0 ? "pl-1 sm:p-l-[5px]" : "pl-1 sm:border-l-[1px]",
                  weekIndex > 0 ? "" : "sm:border-t-0"
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
            {week.eventDetails.map((row, rowIndex) => (
              <div
                className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                key={`week-${getWeek(week.dates[1])}-row-${rowIndex}-${year}-${month}`}
              >
                <div className="w-0 sm:w-6 sm:pr-2" />
                {row.map(({ event, attendance, eventDisplayProps }) => {
                  const reservedStatus =
                    attendance?.attendees.find((attendee) => attendee.user.id === userId)?.reserved ?? null

                  return (
                    <EventCalendarItem
                      key={event.id}
                      eventDetail={{ event, attendance }}
                      eventDisplayProps={eventDisplayProps}
                      reservedStatus={reservedStatus}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ))}

      {eventTypeGuideItems.length > 0 && (
        <div className="flex gap-y-2 gap-x-4 text-sm p-2 sm:pl-6 flex-wrap">
          {eventTypeGuideItems.map(({ type, classes, displayName }) => (
            <span key={type} className="flex items-center">
              <span className={cn("w-3 h-3 rounded-full mr-1", classes.guide)} />
              {displayName}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
