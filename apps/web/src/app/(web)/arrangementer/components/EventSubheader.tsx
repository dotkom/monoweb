import { Link } from "@/components/link"
import { env } from "@/env"
import type { Event } from "@dotkomonline/rpc/event"
import { Button, Text } from "@dotkomonline/ui"
import { IconEditFilled } from "@tabler/icons-react"
import { EventCalendarButton } from "./EventCalendarButton"
import { OrganizerPill } from "./OrganizerPill"

interface EventSubheaderProps {
  event: Event
  isCalendarButtonVisible: boolean
  showAdminLink: boolean
}

export function EventSubheader({ event, isCalendarButtonVisible, showAdminLink }: EventSubheaderProps) {
  const areOrganizersPresent = event.hostingGroups.length > 0 || event.companies.length > 0
  const adminUrl = new URL(`/admin/arrangementer/${event.id}`, env.NEXT_PUBLIC_ORIGIN).toString()

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2">
        {areOrganizersPresent ? (
          <>
            {event.hostingGroups.map((group) => (
              <OrganizerPill key={group.slug} item={group} />
            ))}

            {event.companies.map((company) => (
              <OrganizerPill key={company.id} item={company} />
            ))}
          </>
        ) : (
          <Text className="text-muted-foreground">Ingen arrangører</Text>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isCalendarButtonVisible && <EventCalendarButton event={event} />}

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
