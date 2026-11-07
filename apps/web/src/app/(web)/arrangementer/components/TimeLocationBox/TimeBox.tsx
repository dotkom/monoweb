"use client"

import type { Event } from "@dotkomonline/rpc/event"
import { Text } from "@dotkomonline/ui"
import { IconArrowRight } from "@tabler/icons-react"
import { format as formatDate, isSameDay, isSameYear, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"
import { CalendarBox } from "@/components/atoms/CalendarBox"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { EventCalendarButton } from "../EventCalendarButton"

interface TimeBoxProps {
  event: Event
  showAddToCalendar?: boolean
}

export const TimeBox: FC<TimeBoxProps> = ({ event, showAddToCalendar = false }) => {
  const { start, end } = event

  const sameDay = isSameDay(start, end)
  const showYear = !isSameYear(start, end) || !isThisYear(start) || !isThisYear(end)

  const longDate = (date: Date) =>
    capitalizeFirstLetter(formatDate(date, showYear ? "dd.MM.yyyy" : "EEEE dd. MMMM", { locale: nb }))

  return (
    <section className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
      <CalendarBox start={start} end={end} className="shrink-0 bg-background dark:border-stone-700" />

      {sameDay ? (
        <div className="flex min-w-0 flex-col">
          <Text className="wrap-break-word">{longDate(start)}</Text>
          <Text>
            kl. {formatDate(start, "HH:mm", { locale: nb })} - {formatDate(end, "HH:mm", { locale: nb })}
          </Text>
        </div>
      ) : (
        <div className="flex min-w-0 flex-row flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-col">
            <Text className="wrap-break-word">{capitalizeFirstLetter(formatDate(start, "EEEE", { locale: nb }))}</Text>
            <Text>kl. {formatDate(start, "HH:mm", { locale: nb })}</Text>
          </div>

          <IconArrowRight className="size-5 shrink-0 text-muted-foreground sm:size-6" />

          <div className="flex min-w-0 flex-col">
            <Text className="wrap-break-word">{capitalizeFirstLetter(formatDate(end, "EEEE", { locale: nb }))}</Text>
            <Text>kl. {formatDate(end, "HH:mm", { locale: nb })}</Text>
          </div>
        </div>
      )}

      {showAddToCalendar ? (
        <div className="col-start-2 justify-self-start">
          <EventCalendarButton event={event} />
        </div>
      ) : null}
    </section>
  )
}
