import type { Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
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
    <div className="flex">
      <div className="w-12 flex items-center">
        <Icon icon="tabler:clock" width={24} height={24} />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="flex flex-row gap-[2ch] items-center">
          <span className="flex flex-col">
            <span className="text-lg font-medium">{date.start}</span>
            <span className="text-base">
              {time.start} {!multipleDays ? ` - ${time.end}` : null}
            </span>
          </span>
          {multipleDays && (
            <>
              <Icon icon={"tabler:arrow-right"} className="text-2xl" />
              <span className="flex flex-col">
                <span className="text-lg font-medium">{date.end}</span>
                <span className="text-base">{time.end}</span>
              </span>
            </>
          )}
        </span>
      </div>
      <div className="flex items-center">
        <ActionLink
          href={gcalLink}
          iconHref="https://s3.eu-north-1.amazonaws.com/cdn.staging.online.ntnu.no/Google_Calendar_icon_(2020).svg.png"
          label="Kalender"
        />
      </div>
    </div>
  )
}
