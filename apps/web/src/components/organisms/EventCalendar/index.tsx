import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import { Icon, cn } from "@dotkomonline/ui"
import { getWeek, isThisWeek } from "date-fns"
import Link from "next/link"
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

interface CalendarProps {
  year: number
  month: number
}

export const EventCalendar: FC<CalendarProps> = async ({ year, month }) => {
  const [session, eventDetails] = await Promise.all([
    auth.getServerSession(),
    server.event.all.query({
      page: { take: 100 },
      filter: {
        after: new Date(year, month, 1),
        before: new Date(year, month + 1, 0),
      },
    }),
  ])

  const attendanceIds = eventDetails.map(({ attendance }) => attendance?.id).filter(Boolean) as string[]
  const userId = session?.sub

  const attendeeStatuses = userId
    ? await server.attendance.getAttendeeStatuses.query({
        attendanceIds,
        userId,
      })
    : null

  const cal = getCalendarArray(year, month, eventDetails)

  const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"]
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

  const nowDate = new Date()
  nowDate.setHours(0, 0, 0, 0)

  return (
    <div className="mb-10 mt-2 sm:mt-[-40px]">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="w-full flex items-center gap-4 justify-between sm:justify-end pb-4">
          <h2 className="text-xl">
            {months[month]} {year}
          </h2>
          <div className="flex gap-2 sm:gap-0">
            <Link
              className="rounded-full hover:bg-gray-200 dark:hover:bg-stone-800 flex p-3 sm:p-2 duration-200"
              href={`/arrangementer/kalender/${month === 0 ? year - 1 : year}/${month === 0 ? 12 : month}`}
            >
              <Icon icon="tabler:chevron-left" width={24} height={24} />
            </Link>
            <Link
              className="rounded-full hover:bg-gray-200 dark:hover:bg-stone-800 flex p-3 sm:p-2 duration-200"
              href={`/arrangementer/kalender/${month === 11 ? year + 1 : year}/${month === 11 ? 1 : month + 2}`}
            >
              <Icon icon="tabler:chevron-right" width={24} height={24} />
            </Link>
          </div>
        </div>
      </div>
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
        <div className="relative min-h-28" key={`week-${getWeek(week.dates[1])}-${cal.year}-${cal.month}`}>
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
                  "py-1 pr-1 relative flex flex-col items-center sm:items-end border-gray-300 dark:border-stone-700",
                  week.dates.indexOf(day) % 7 === 0 ? "p-l-[5px]" : "pl-1 border-l-[1px]",
                  weekIndex > 0 ? "border-t-[1px]" : ""
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
            {week.events.map((row, rowIndex) => (
              <div
                className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                key={`week-${getWeek(week.dates[1])}-row-${rowIndex}-${year}-${month}`}
              >
                <div className="w-0 sm:w-6 sm:pr-2" />
                {row.map(({ eventDisplayProps, ...eventDetail }) => {
                  const attendeeStatus = attendeeStatuses?.get(eventDetail.attendance?.id ?? "") || null

                  return (
                    <EventCalendarItem
                      key={eventDetail.event.id}
                      eventDetail={eventDetail}
                      attendeeStatus={attendeeStatus}
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
      <div className="flex gap-4 text-sm p-2 sm:pl-6">
        <span className="flex items-center">
          <span className="w-3 h-3 bg-green-400 dark:bg-green-400 rounded-full mr-1" />
          Sosialt
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 bg-red-400 dark:bg-red-400 rounded-full mr-1" />
          Kurs
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 bg-blue-400 dark:bg-blue-400 rounded-full mr-1" />
          Bedpres
        </span>
      </div>
    </div>
  )
}
