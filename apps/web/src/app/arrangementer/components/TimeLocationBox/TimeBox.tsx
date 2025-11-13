"use client"

import type { Event } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { IconArrowRight, IconClock } from "@tabler/icons-react"
import { format as formatDate, isSameDay } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"
import { ActionLink } from "./ActionLink"
import { createGoogleCalendarLink } from "./utils"

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
  const longDate = (date: Date) => formatDate(date, "dd. MMMM", { locale: nb })

  return (
    <div className="flex flex-row gap-4 items-center">
      <IconClock className="size-6 shrink-0 text-gray-600 dark:text-stone-400" />

      {isSame ? (
        <div className="flex flex-col grow">
          <Text>{longDate(start)}</Text>
          <Text>
            kl. {formatDate(start, "HH:mm", { locale: nb })} - {formatDate(end, "HH:mm", { locale: nb })}
          </Text>
        </div>
      ) : (
        <div className="flex flex-row grow gap-4 items-center">
          <div className="flex flex-col">
            <Text>{shortDate(start)}</Text>
            <Text>kl. {formatDate(start, "HH:mm", { locale: nb })}</Text>
          </div>

          <IconArrowRight className="size-6 shrink-0 text-gray-600 dark:text-stone-400" />

          <div className="flex flex-col">
            <Text>{shortDate(end)}</Text>
            <Text>kl. {formatDate(end, "HH:mm", { locale: nb })}</Text>
          </div>
        </div>
      )}

      {gcalLink && <ActionLink href={gcalLink} label="Se på Google Calendar" />}
    </div>
  )
}
