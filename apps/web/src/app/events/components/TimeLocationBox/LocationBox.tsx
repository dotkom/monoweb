import type { Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import type { FC } from "react"
import { LocationLink } from "./LocationLink"

interface LocationBoxProps {
  event: Event
}

export const LocationBox: FC<LocationBoxProps> = ({ event }) => {
  const { locationAddress, locationTitle, locationLink } = event

  return (
    <div className="flex">
      <div className="w-12 flex items-center">
        <Icon icon="tabler:map-pin" width={24} height={24} />
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <div className="font-medium text-lg">{locationTitle}</div>
        <div className="text-base">{locationAddress}</div>
      </div>
      {locationLink && <LocationLink link={locationLink} />}
    </div>
  )
}
