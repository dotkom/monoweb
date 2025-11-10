"use client"

import type { Event } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { IconArrowRight, IconClock } from "@tabler/icons-react"
import { formatDate, isSameDay } from "date-fns"
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

  return (
    <div className="flex flex-row gap-4 items-center">
      <IconClock className="size-6" />

      <div className="flex flex-row grow gap-4 items-center">
        <div className="flex flex-col">
          <Text>{formatDate(start, "dd. MMMM", { locale: nb })}</Text>
          <Text>
            {formatDate(start, "HH:mm", { locale: nb })}{" "}
            {isSameDay(start, end) ? ` - ${formatDate(end, "HH:mm", { locale: nb })}` : null}
          </Text>
        </div>
        {!isSameDay(start, end) && (
          <>
            <IconArrowRight className="size-6" />
            <div className="flex flex-col">
              <Text>{formatDate(end, "dd. MMMM", { locale: nb })}</Text>
              <Text>{formatDate(end, "HH:mm", { locale: nb })}</Text>
            </div>
          </>
        )}
      </div>

      {gcalLink && <ActionLink href={gcalLink} label="Se på Google Calendar" />}
    </div>
  )
}
