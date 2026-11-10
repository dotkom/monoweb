import { Link } from "@/components/link"
import { env } from "@/env"
import type { Event } from "@dotkomonline/rpc/event"
import { Button } from "@dotkomonline/ui"
import { IconEditFilled } from "@tabler/icons-react"
import { EventCalendarButton } from "./EventCalendarButton"
import { EventFollowButton } from "./EventFollowButton"
import { OrganizerList } from "./OrganizerList"

interface EventSubheaderProps {
  event: Event
  isCalendarButtonVisible: boolean
  showAdminLink: boolean
}

export function EventSubheader({ event, isCalendarButtonVisible, showAdminLink }: EventSubheaderProps) {
  const organizers = [...event.hostingGroups, ...event.companies]
  const adminUrl = new URL(`/admin/arrangementer/${event.id}`, env.NEXT_PUBLIC_ORIGIN).toString()

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-4">
      <OrganizerList organizers={organizers} />

      <div className="flex shrink-0 items-center gap-2">
        {isCalendarButtonVisible && <EventCalendarButton event={event} />}

        <EventFollowButton />

        {showAdminLink && (
          <Button
            element={Link}
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="default"
            color="dark"
            aria-label="Rediger arrangement"
            title="Rediger arrangement"
            className="rounded-full text-base pl-2.5"
          >
            <IconEditFilled aria-hidden className="size-5" />
            Rediger
          </Button>
        )}
      </div>
    </div>
  )
}
