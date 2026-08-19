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

  if (!locationTitle && !locationAddress) {
    return null
  }

  const content = (
    <>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-gray-200 dark:border-stone-700 dark:bg-stone-800">
        <IconMapPin className="size-6 shrink-0 text-muted-foreground" />
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        {locationTitle && <Text className="truncate">{locationTitle}</Text>}
        {locationAddress && (
          <Text className={cn("truncate", locationTitle && "text-muted-foreground")}>{locationAddress}</Text>
        )}
      </div>

      {locationLink && (
        <IconArrowUpRight
          aria-hidden
          className="size-5 shrink-0 text-muted-foreground transition-[transform,color] group-hover/location-box:scale-120 group-hover/location-box:text-foreground"
        />
      )}
    </>
  )

  const boxClassName = cn(
    "flex w-full min-w-0 flex-row items-center gap-3 p-2 -mx-2 rounded-xl sm:gap-4",
    locationLink && "group/location-box transition-colors hover:bg-gray-100 dark:hover:bg-stone-800"
  )

  if (locationLink) {
    return (
      <Link className={boxClassName} href={locationLink} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    )
  }

  return <section className={boxClassName}>{content}</section>
}
