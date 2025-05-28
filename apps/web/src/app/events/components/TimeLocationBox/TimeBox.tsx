import type { Event } from "@dotkomonline/types"
import { Icon, Text } from "@dotkomonline/ui"
import { DateFns } from "@dotkomonline/utils"
import type { FC } from "react"
import { ActionLink } from "./ActionLink"
import { createGoogleCalendarLink } from "./utils"

interface TimeBoxProps {
  event: Event
}

const formatTime = (date: Date) => DateFns.formatDate(date, "HH:mm")
const formatDate = (date: Date) => {
  const format = DateFns.isSameYear(date, new Date()) ? "dd. MMMM" : "dd. MMM yyyy"

  return DateFns.formatDate(date, format).toLowerCase()
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
    <div className="flex">
      <div className="w-12 flex items-center">
        <Icon icon="tabler:clock" width={24} height={24} />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-row gap-[2ch] items-center">
          <div className="flex flex-col">
            <Text>{formatDate(start)}</Text>
            <Text>
              {formatTime(start)} {DateFns.isSameDay(start, end) && ` - ${formatTime(end)}`}
            </Text>
          </div>

          {!DateFns.isSameDay(start, end) && (
            <>
              <Icon icon={"tabler:arrow-right"} className="text-2xl" />

              <div className="flex flex-col">
                <Text>{formatDate(end)}</Text>
                <Text>{formatTime(end)}</Text>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <ActionLink href={gcalLink} label="Se på Google Calendar" />
      </div>
    </div>
  )
}
