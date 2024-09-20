import { Icon } from "@dotkomonline/ui"
import { IntlFormats } from "@dotkomonline/utils"
import type { FC } from "react"
import { ActionLink } from "./ActionLink"
import { LocationLink } from "./LocationLink"
import { createGoogleCalendarLink } from "./utils"

interface Props {
  locationTitle: string
  locationAddress: string | null
  datetimeStart: Date
  datetimeEnd: Date
  eventTitle: string
  eventDescription: string | null
  locationLink: string | null
}

const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

const formatWithIntl = (date: Date, format: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("nb-NO", format).format(date)

export const TimeLocationBox: FC<Props> = ({
  locationTitle,
  locationAddress,
  datetimeStart,
  datetimeEnd,
  eventTitle: eventSummary,
  eventDescription,
  locationLink,
}) => {
  const weekdays = [formatWithIntl(datetimeStart, IntlFormats.Weekday)]
  const dates = [formatWithIntl(datetimeStart, IntlFormats.Date)]
  const time = formatWithIntl(datetimeStart, IntlFormats.Time)

  if (datetimeStart.getDate() !== datetimeEnd.getDate()) {
    weekdays.push(formatWithIntl(datetimeEnd, IntlFormats.Weekday))
    dates.push(formatWithIntl(datetimeEnd, IntlFormats.Date))
  }

  const gcalLink = createGoogleCalendarLink({
    title: eventSummary,
    location: locationAddress ?? "",
    description: eventDescription ?? "",
    start: datetimeStart,
    end: datetimeEnd,
  })

  return (
    <div className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-6 gap-3">
      <h2 className="border-none">Oppmøte</h2>
      <div className="text-xs">
        {/* Time */}
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
        {/* Place */}
        <div className="flex">
          <div className="w-12 flex items-center">
            <Icon icon="tabler:map-pin" width={24} height={24} />
          </div>
          <div className="flex-1 justify-center flex flex-col">
            <div className="text-lg">{locationTitle}</div>
            <div>{locationAddress}</div>
          </div>
          {locationLink && <LocationLink link={locationLink} />}
        </div>
      </div>
    </div>
  )
}
