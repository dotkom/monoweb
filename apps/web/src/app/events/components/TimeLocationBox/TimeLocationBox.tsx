import { Icon } from "@dotkomonline/ui"
import type { FC } from "react"
import { ActionLink } from "./ActionLink"
import { LocationLink } from "./LocationLink"
import { createGoogleCalendarLink } from "./utils"
import { IntlFormats } from "@dotkomonline/utils"

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

export const TimeLocationBox: FC<Props> = ({
  locationTitle,
  locationAddress,
  datetimeStart,
  datetimeEnd,
  eventTitle: eventSummary,
  eventDescription,
  locationLink,
}) => {
  const weekday = new Intl.DateTimeFormat("nb-NO", IntlFormats.Weekday).format(datetimeStart)
  const date = new Intl.DateTimeFormat("nb-NO", IntlFormats.Date).format(datetimeStart)
  const time = new Intl.DateTimeFormat("nb-NO", IntlFormats.Time).format(datetimeStart)

  const gcalLink = createGoogleCalendarLink({
    title: eventSummary,
    location: locationAddress ?? "",
    description: eventDescription ?? "",
    start: datetimeStart,
    end: datetimeEnd,
  })

  return (
    <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
      <h2>Oppmøte</h2>
      <div className="text-xs">
        {/* Time */}
        <div className="flex mb-8 mt-4">
          <div className="w-12 flex items-center">
            <Icon icon="tabler:clock" width={24} height={24} />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-lg">{capitalize(weekday)}</span>
            <span>{date}</span>
            <span>{time}</span>
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
