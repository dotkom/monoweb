"use client"

import type { Event } from "@dotkomonline/rpc/event"
import { cn, Text } from "@dotkomonline/ui"
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react"
import { format as formatDate, isSameDay } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"
import { createGoogleCalendarLink } from "./utils"
import { CalendarBox } from "@/components/atoms/CalendarBox"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import Link from "next/link"

interface TimeBoxProps {
  event: Event
}

export const TimeBox: FC<TimeBoxProps> = ({ event }) => {
  const { start, end, locationAddress, description, title: eventSummary } = event

  const gcalLink = createGoogleCalendarLink({
    title: eventSummary,
    location: locationAddress ?? "",
    description: description ?? "",
    start,
    end,
  })

  const isSame = isSameDay(start, end)

  const shortDate = (date: Date) => formatDate(date, "dd. MMM", { locale: nb })
  const longDate = (date: Date) => capitalizeFirstLetter(formatDate(date, "cccc dd. MMMM", { locale: nb }))

  return (
    <Link
      className={cn(
        "group/time-box flex w-full min-w-0 flex-row items-center gap-3 p-2 -mx-2 rounded-xl sm:gap-4",
        "transition-colors hover:bg-gray-100 dark:hover:bg-stone-800"
      )}
      href={gcalLink}
      target="_blank"
      rel="noopener noreferrer"
    >
      <CalendarBox
        start={start}
        end={end}
        className="shrink-0 bg-background dark:border-stone-700"
        containerClassName="shrink-0"
        titleClassName="transition-colors"
      />

      {isSame ? (
        <div className="flex min-w-0 flex-col">
          <Text className="truncate">{longDate(start)}</Text>
          <Text className="truncate">
            kl. {formatDate(start, "HH:mm", { locale: nb })} - {formatDate(end, "HH:mm", { locale: nb })}
          </Text>
        </div>
      ) : (
        <div className="flex min-w-0 flex-row items-center gap-x-2 sm:gap-x-4">
          <div className="flex min-w-0 flex-col">
            <Text className="truncate">{shortDate(start)}</Text>
            <Text className="truncate">kl. {formatDate(start, "HH:mm", { locale: nb })}</Text>
          </div>

          <IconArrowRight className="size-5 shrink-0 text-gray-600 dark:text-stone-400 sm:size-6" />

          <div className="flex min-w-0 flex-col">
            <Text className="truncate">{shortDate(end)}</Text>
            <Text className="truncate">kl. {formatDate(end, "HH:mm", { locale: nb })}</Text>
          </div>
        </div>
      )}

      <IconArrowUpRight
        aria-hidden
        className="size-5 transition-[transform,color] group-hover/time-box:scale-120 shrink-0 text-muted-foreground group-hover/time-box:text-foreground"
      />
    </Link>
  )
}
