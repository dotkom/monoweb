import type { Event } from "@dotkomonline/types"
import { Icon, Text } from "@dotkomonline/ui"
import type { FC } from "react"
import { ActionLink } from "./ActionLink"
import { createGoogleCalendarLink } from "./utils"
import { formatDate, isSameDay } from "date-fns"

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
      <Icon icon="tabler:clock" className="text-xl" />

      <div className="flex flex-row grow gap-4 items-center">
        <div className="flex flex-col">
          <Text>{formatDate(start, "dd. MMMM")}</Text>
          <Text>
            {formatDate(start, "HH:mm")} {isSameDay(start, end) ? ` - ${formatDate(end, "HH:mm")}` : null}
          </Text>
        </div>
        {!isSameDay(start, end) && (
          <>
            <Icon icon="tabler:arrow-right" className="text-2xl" />
            <div className="flex flex-col">
              <Text>{formatDate(end, "dd. MMMM")}</Text>
              <Text>{formatDate(end, "HH:mm")}</Text>
            </div>
          </>
        )}
      </div>

      {gcalLink && <ActionLink href={gcalLink} label="Se på Google Calendar" />}
    </div>
  )
}
