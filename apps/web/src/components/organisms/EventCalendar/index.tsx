"use client"

import { useEventAllQuery } from "@/app/arrangementer/components/queries"
import { TZDate } from "@date-fns/tz"
import { useSession } from "@dotkomonline/oauth2/react"
import type { Event } from "@dotkomonline/types"
import { cn } from "@dotkomonline/ui"
import { getWeek, isThisWeek } from "date-fns"
import type { FC } from "react"
import { EventCalendarItem } from "./EventCalendarItem"
import { getCalendarArray } from "./getCalendarArray"

// helper functions so tailwind picks up the class names correctly
function getColStartClass(startCol: number) {
  switch (startCol) {
    case 3:
      return "col-start-3"
    case 4:
      return "col-start-4"
    case 5:
      return "col-start-5"
    case 6:
      return "col-start-6"
    case 7:
      return "col-start-7"
    case 8:
      return "col-start-8"
    default:
      return ""
  }
}

function getColSpanClass(span: number) {
  switch (span) {
    case 1:
      return "col-span-1"
    case 2:
      return "col-span-2"
    case 3:
      return "col-span-3"
    case 4:
      return "col-span-4"
    case 5:
      return "col-span-5"
    case 6:
      return "col-span-6"
    case 7:
      return "col-span-7"
    default:
      return ""
  }
}

function getEventTypeGuide(events: Event[]) {
  const eventTypeConfig = {
    SOCIAL: { color: "bg-green-400 dark:bg-green-400", label: "Sosialt" },
    ACADEMIC: { color: "bg-blue-400 dark:bg-blue-400", label: "Kurs" },
    COMPANY: {
      color: "bg-red-400 dark:bg-red-400",
      label: "Bedriftsarrangement",
    },
    WELCOME: { color: "bg-yellow-400 dark:bg-yellow-400", label: "Fadderuke" },
    OTHER: { color: "bg-yellow-400 dark:bg-yellow-400", label: "Annet" },
    GENERAL_ASSEMBLY: {
      color: "bg-yellow-400 dark:bg-yellow-400",
      label: "Generalforsamling",
    },
    INTERNAL: { color: "bg-yellow-400 dark:bg-yellow-400", label: "Internt" },
  }

  const presentTypes = new Set(events.map((event) => event.type))

  // Return only the items for types that are present
  return Array.from(presentTypes)
    .filter((type) => eventTypeConfig[type as keyof typeof eventTypeConfig]) // Filter out unknown types
    .map((type) => ({
      type,
      ...eventTypeConfig[type as keyof typeof eventTypeConfig],
    }))
}

interface CalendarProps {
  year: number
  month: number
}

export const EventCalendar: FC<CalendarProps> = ({ year, month }) => {
  const session = useSession()

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllQuery({
    filter: {
      byStartDate: {
        min: new TZDate(year, month, 1),
        max: new TZDate(year, month + 1, 0),
      },
      excludingOrganizingGroup: ["velkom"],
      orderBy: "asc",
    },
    page: {
      take: 1000,
    },
  })

  const eventDetails = futureEventWithAttendances
  const userId = session?.sub

  const cal = getCalendarArray(year, month, eventDetails)
  const eventTypeGuideItems = getEventTypeGuide(eventDetails.map(({ event }) => event))

  const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"]

  const nowDate = new Date()
  nowDate.setHours(0, 0, 0, 0)

  return (
    <div>
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
                      reservedStatus={reservedStatus}
                      className={cn(
                        getColStartClass(eventDisplayProps.startCol + 2),
                        getColSpanClass(eventDisplayProps.span),
                        eventDisplayProps.leftEdge && "sm:border-l-4 rounded-l-md",
                        eventDisplayProps.rightEdge && "rounded-r-md"
                      )}
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
          {eventTypeGuideItems.map(({ type, color, label }) => (
            <span key={type} className="flex items-center">
              <span className={`w-3 h-3 ${color} rounded-full mr-1`} />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
