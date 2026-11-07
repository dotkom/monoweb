import type { Event } from "@dotkomonline/rpc/event"
import { cn, Text } from "@dotkomonline/ui"
import { IconArrowUpRight, IconMapPin } from "@tabler/icons-react"
import Link from "next/link"
import type { FC } from "react"

interface LocationBoxProps {
  event: Event
}

export const LocationBox: FC<LocationBoxProps> = ({ event }) => {
  const { locationAddress, locationTitle, locationLink } = event

  const isLocationTitlePresent = locationTitle !== null && locationTitle !== ""
  const isLocationAddressPresent = locationAddress !== null && locationAddress !== ""
  const isLocationLinkPresent = locationLink !== null && locationLink !== ""

  if (isLocationTitlePresent === false && isLocationAddressPresent === false) {
    return null
  }

  const locationHeading = isLocationTitlePresent ? locationTitle : locationAddress

  const content = (
    <>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-gray-200 dark:border-stone-700 dark:bg-stone-800">
        <IconMapPin className="size-6 shrink-0 text-muted-foreground transition-colors group-hover/location-box:text-foreground group-focus-visible/location-box:text-foreground" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <Text className="flex min-w-0 items-center gap-1">
          <span className="truncate">{locationHeading}</span>

          {isLocationLinkPresent && (
            <IconArrowUpRight
              aria-hidden
              className="size-4.5 shrink-0 text-muted-foreground transition-[translate,color] group-hover/location-box:text-foreground group-focus-visible/location-box:text-foreground motion-safe:group-hover/location-box:translate-x-0.5 motion-safe:group-hover/location-box:-translate-y-px motion-safe:group-focus-visible/location-box:translate-x-0.5 motion-safe:group-focus-visible/location-box:-translate-y-0.5"
            />
          )}
        </Text>

        {isLocationTitlePresent && isLocationAddressPresent && (
          <Text className="truncate text-muted-foreground transition-colors group-hover/location-box:text-foreground group-focus-visible/location-box:text-foreground">
            {locationAddress}
          </Text>
        )}
      </div>
    </>
  )

  const boxClassName = cn(
    "flex min-w-0 flex-row items-center gap-3 rounded-xl",
    isLocationLinkPresent && "group/location-box"
  )

  if (isLocationLinkPresent) {
    return (
      <Link className={boxClassName} href={locationLink} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    )
  }

  return <section className={boxClassName}>{content}</section>
}
