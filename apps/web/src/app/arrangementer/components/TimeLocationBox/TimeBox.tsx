import type { Event } from "@dotkomonline/types"
import { Icon, Text } from "@dotkomonline/ui"
import { IntlFormats } from "@dotkomonline/utils"
import type { FC } from "react"
import { ActionLink } from "./ActionLink"
import { createGoogleCalendarLink } from "./utils"

interface TimeBoxProps {
  event: Event
}

const formatWithIntl = (date: Date, format: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("nb-NO", format).format(date)

export const TimeBox: FC<TimeBoxProps> = ({ event }) => {
  const { start, end, locationAddress, description, title: eventSummary } = event

  const multipleDays = start.getDate() !== end.getDate()

  const time = { start: formatWithIntl(start, IntlFormats.Time), end: formatWithIntl(end, IntlFormats.Time) }
  const date = { start: formatWithIntl(start, IntlFormats.ShortDate), end: formatWithIntl(end, IntlFormats.ShortDate) }

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
          <Text>{date.start}</Text>
          <Text>
            {time.start} {!multipleDays ? ` - ${time.end}` : null}
          </Text>
        </div>
        {multipleDays && (
          <>
            <Icon icon="tabler:arrow-right" className="text-2xl" />
            <div className="flex flex-col">
              <Text>{date.end}</Text>
              <Text>{time.end}</Text>
            </div>
          </>
        )}
      </div>

      {gcalLink && <ActionLink href={gcalLink} label="Se på Google Calendar" />}
    </div>
  )
}
