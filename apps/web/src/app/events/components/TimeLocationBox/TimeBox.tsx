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
  const dates = [formatWithIntl(start, IntlFormats.ShortDate)]

  if (start.getDate() !== end.getDate()) {
    weekdays.push(formatWithIntl(end, IntlFormats.Weekday))
    dates.push(formatWithIntl(end, IntlFormats.ShortDate))
  }

  const gcalLink = createGoogleCalendarLink({
    title: eventSummary,
    location: locationAddress ?? "",
    description: description ?? "",
    start,
    end,
  })

  // TODO refactor
  return (
    <div className="flex mb-8 mt-4">
      <div className="w-12 flex items-center">
        <Icon icon="tabler:clock" width={24} height={24} />
      </div>
      <div className="flex flex-col">
        <span className="flex flex-row gap-[1ch]">
            <span className="flex flex-col">
                <span className="text-lg">{dates[0]}</span>
                <span className="text-lg">{formatWithIntl(start, IntlFormats.Time)} {dates.length === 1 ? ` til ${formatWithIntl(end, IntlFormats.Time)}` : null }</span>
            </span>
            {dates.length > 1 && (
                <>
                    <span className="text-lg">til</span>
                    <span className="flex flex-col">
                        <span className="text-lg">{dates[1]}</span>
                        <span className="text-lg">kl. {formatWithIntl(end, IntlFormats.Time)}</span>
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
