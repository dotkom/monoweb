import type { Event } from "@dotkomonline/types"
import { Icon, Text } from "@dotkomonline/ui"
import type { FC } from "react"
import { LocationLink } from "./LocationLink"

interface LocationBoxProps {
  event: Event
}

export const LocationBox: FC<LocationBoxProps> = ({ event }) => {
  const { locationAddress, locationTitle, locationLink } = event

  if (!locationTitle) {
    return null
  }

  return (
    <section className="flex flex-row gap-4 items-center">
      <Icon icon="tabler:map-pin" className="text-xl" />

      <div className="flex flex-col grow justify-center">
        <Text>{locationTitle}</Text>
        <Text>{locationAddress}</Text>
      </div>

      {locationLink && <LocationLink link={locationLink} />}
    </section>
  )
}
