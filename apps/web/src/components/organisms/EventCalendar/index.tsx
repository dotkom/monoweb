import EventsViewToggle from "@/components/molecules/EventsViewToggle"
import { Icon } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"
import EventCalendarItem from "./EventCalendarItem"
import type { CalendarData } from "./types"

interface CalendarProps {
  cal: CalendarData
}

function getWeekNum(date: Date): number {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date")
  }

  const currentDate = new Date(date.getTime())
  currentDate.setUTCDate(currentDate.getUTCDate() + 3 - ((currentDate.getUTCDay() + 6) % 7))

  const startOfYear = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 4))
  const startYearThursday = new Date(startOfYear)
  startYearThursday.setUTCDate(startYearThursday.getUTCDate() - ((startYearThursday.getUTCDay() + 6) % 7))

  const daysDifference = Math.floor((currentDate.getTime() - startYearThursday.getTime()) / (24 * 60 * 60 * 1000))

  return Math.ceil((daysDifference + 1) / 7)
}

function isWeekActive(weekNumber: number): boolean {
  const getCurrentWeekNumber = (): number => {
    const today = new Date()
    today.setUTCDate(today.getUTCDate() + 3 - ((today.getUTCDay() + 6) % 7))

    const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 4))
    const startYearThursday = new Date(startOfYear)
    startYearThursday.setUTCDate(startYearThursday.getUTCDate() - ((startYearThursday.getUTCDay() + 6) % 7))

    const daysDifference = Math.floor((today.getTime() - startYearThursday.getTime()) / (24 * 60 * 60 * 1000))

    return Math.ceil((daysDifference + 1) / 7)
  }

  const currentWeekNumber = getCurrentWeekNumber()
  return currentWeekNumber === weekNumber
}

const EventCalendar: FC<CalendarProps> = ({ cal }) => {
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
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <EventsViewToggle active="cal" />
        <div className="w-full flex items-center gap-4 justify-between sm:justify-end">
          <h2>
            {months[cal.month]} {cal.year}
          </h2>
          <div className="flex pb-2 gap-2 sm:gap-0">
            <Link
              className="rounded-full hover:bg-slate-4 flex p-3 sm:p-2 duration-200"
              href={`/events/calendar/${cal.month === 0 ? cal.year - 1 : cal.year}/${cal.month === 0 ? 12 : cal.month}`}
            >
              <Icon icon="tabler:chevron-left" width={24} height={24} />
            </Link>
            <Link
              className="rounded-full hover:bg-slate-4 flex p-3 sm:p-2 duration-200"
              href={`/events/calendar/${cal.month === 11 ? cal.year + 1 : cal.year}/${cal.month === 11 ? 1 : cal.month + 2}`}
            >
              <Icon icon="tabler:chevron-right" width={24} height={24} />
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 sm:grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr]">
        <div className="hidden sm:block w-6 pr-2 text-slate-10 text-xs leading-5">Uke</div>
        {weekdays.map((day) => (
          <div
            key={day}
            className={`
                text-center sm:text-end sm:pr-3 leading-5
                ${(nowDate.getDay() === 0 ? 6 : nowDate.getDay() - 1) === weekdays.indexOf(day) ? "font-semibold text-sm" : "text-slate-10 text-xs"}
              `}
          >
            <span className="sm:hidden">{day[0]}</span>
            <span className="hidden sm:block">{day}</span>
          </div>
        ))}
      </div>
      {cal.weeks.map((week, weekIndex) => (
        <div className="relative min-h-28" key={`week-${getWeekNum(week.dates[1])}-${cal.year}-${cal.month}`}>
          <div className="grid grid-cols-7 sm:grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] bottom-0 top-0 absolute w-full h-full">
            <div
              className={`hidden sm:flex w-6 pr-2 items-center justify-center ${
                isWeekActive(getWeekNum(week.dates[1])) ? "font-semibold text-sm" : "text-slate-10 text-xs"
              }`}
            >
              {getWeekNum(week.dates[1])}
            </div>
            {week.dates.map((day) => (
              <div
                key={new Date(day).toISOString()}
                className={`
                    py-1 pr-1 relative flex flex-col items-center sm:items-end border-slate-8
                    ${week.dates.indexOf(day) % 7 === 0 ? "p-l-[5px]" : "pl-1 border-l-[1px]"}
                    ${weekIndex > 0 ? "border-t-[1px]" : ""}
                  `}
              >
                <span
                  className={`
                      text-sm w-7 h-7 leading-7 text-center
                      ${new Date(day).getTime() > nowDate.getTime() ? "" : "text-slate-10"}
                      ${new Date(day).getTime() === nowDate.getTime() ? "font-semibold rounded-full bg-red-10 text-white" : ""}
                    `}
                >
                  {new Date(day).getDate()}
                </span>
              </div>
            ))}
          </div>

          <div className="relative pt-10 pb-1">
            {week.events.map((row, rowIndex) => (
              <div
                className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr]"
                key={`week-${getWeekNum(week.dates[1])}-row-${rowIndex}-${cal.year}-${cal.month}`}
              >
                <div className="w-0 sm:w-6 sm:pr-2" />
                {row.map((event) => (
                  <EventCalendarItem
                    key={event.id}
                    event={event}
                    classNames={`
                        col-start-${event.startCol + 2} col-span-${event.span}
                        ${event.leftEdge ? "sm:border-l-4 rounded-l-md" : ""}
                        ${event.rightEdge ? "rounded-r-md" : ""}
                      `}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-4 text-sm p-2 sm:pl-6">
        <span className="flex items-center">
          <span className="w-3 h-3 bg-red-8 rounded-full mr-1" />
          Sosialt
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 bg-blue-8 rounded-full mr-1" />
          Kurs
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 bg-green-8 rounded-full mr-1" />
          Bedpres
        </span>
      </div>
    </div>
  )
}

export default EventCalendar
