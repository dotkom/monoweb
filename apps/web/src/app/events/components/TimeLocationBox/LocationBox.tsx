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
      <div className="flex-1 justify-center flex flex-col">
        <div className="text-lg">{locationTitle}</div>
        <div>{locationAddress}</div>
      </div>
      {locationLink && <LocationLink link={locationLink} />}
    </div>
  )
}
