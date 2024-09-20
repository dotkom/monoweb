import type { Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { IntlFormats } from "@dotkomonline/utils"
import type { FC } from "react"
import { ActionLink } from "./ActionLink"
import { createGoogleCalendarLink } from "./utils"

interface TimeBoxProps {
  event: Event
}

const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

const formatWithIntl = (date: Date, format: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("nb-NO", format).format(date)

export const TimeBox: FC<TimeBoxProps> = ({ event }) => {
  const { start, end, locationAddress, description, title: eventSummary } = event

  const weekdays = [formatWithIntl(start, IntlFormats.Weekday)]
  const dates = [formatWithIntl(start, IntlFormats.Date)]
  const time = formatWithIntl(start, IntlFormats.Time)

  if (start.getDate() !== end.getDate()) {
    weekdays.push(formatWithIntl(end, IntlFormats.Weekday))
    dates.push(formatWithIntl(end, IntlFormats.Date))
  }

  const gcalLink = createGoogleCalendarLink({
    title: eventSummary,
    location: locationAddress ?? "",
    description: description ?? "",
    start,
    end,
  })

  return (
    <div className="flex mb-8 mt-4">
      <div className="w-12 flex items-center">
        <Icon icon="tabler:clock" width={24} height={24} />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-lg">{dates.join(" til ")}</span>
        <span className="text-sm">{capitalize(weekdays.join(" til "))}</span>
        <span className="text-sm">{time}</span>
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
