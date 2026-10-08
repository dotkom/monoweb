"use client"

import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { EventPreviewContext, type PreviewEvent } from "@/components/molecules/EventListItem/EventPreviewLink"
import { env } from "@/env"
import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  ReadMore,
  Text,
  Title,
  cn,
} from "@dotkomonline/ui"
import { createAbsoluteEventPageUrl, createEventPageUrl } from "@dotkomonline/utils"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { IconArrowUpRight, IconCheck, IconChevronsRight, IconCopy } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from "react"
import { AttendanceCard } from "./AttendanceCard/AttendanceCard"
import { EventDescription } from "./EventDescription"
import { EventHeader, SkeletonEventHeader } from "./EventHeader"
import { OrganizerPill } from "./OrganizerPill"
import { LocationBox } from "./TimeLocationBox/LocationBox"
import { TimeBox } from "./TimeLocationBox/TimeBox"

export function EventPreview({ children, className }: PropsWithChildren<{ className?: string }>) {
  const [selectedEvent, setSelectedEvent] = useState<PreviewEvent | null>(null)
  const [open, setOpen] = useState(false)

  const { icon, copy } = useCopyToClipboard()

  const triggerRef = useRef<HTMLAnchorElement | null>(null)

  const openPreview = useCallback((event: PreviewEvent, trigger: HTMLAnchorElement) => {
    if (trigger.closest('[data-slot="drawer-content"]') === null) {
      triggerRef.current = trigger
    }

    setSelectedEvent(event)
    setOpen(true)
  }, [])

  useEffect(() => {
    if (open === false) {
      return
    }

    const desktop = window.matchMedia("(min-width: 768px)")

    const closeOnMobile = () => {
      if (desktop.matches === false) {
        setOpen(false)
      }
    }

    closeOnMobile()

    desktop.addEventListener("change", closeOnMobile)

    return () => {
      desktop.removeEventListener("change", closeOnMobile)
    }
  }, [open])

  return (
    <EventPreviewContext.Provider value={openPreview}>
      <div className={className}>{children}</div>
      <Drawer direction="right" open={open} onOpenChange={setOpen} repositionInputs={false}>
        <DrawerContent
          aria-describedby={undefined}
          overlayClassName="bg-black/20 dark:bg-black/50 supports-backdrop-filter:backdrop-blur-none"
          className={cn(
            "overflow-hidden border border-field-border shadow-xl",
            "data-[vaul-drawer-direction=right]:inset-y-4",
            "data-[vaul-drawer-direction=right]:right-4",
            "data-[vaul-drawer-direction=right]:rounded-xl",
            "data-[vaul-drawer-direction=right]:w-[min(--spacing(152),60vw)]",
            "data-[vaul-drawer-direction=right]:sm:max-w-none"
          )}
          onCloseAutoFocus={(event) => {
            event.preventDefault()

            const trigger = triggerRef.current

            if (trigger !== null) {
              trigger.focus()
            }
          }}
        >
          <DrawerHeader className="shrink-0 border-b border-field-border">
            <DrawerTitle className="sr-only">{selectedEvent?.title ?? "Arrangement"}</DrawerTitle>

            <div className="flex flex-row items-center gap-5">
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" aria-label="Lukk arrangement">
                  <IconChevronsRight className="size-5" />
                </Button>
              </DrawerClose>

              <div className="flex flex-row items-center gap-2">
                {selectedEvent !== null && (
                  <Button
                    onClick={() => {
                      const eventUrl = createAbsoluteEventPageUrl(
                        env.NEXT_PUBLIC_ORIGIN,
                        selectedEvent.id,
                        selectedEvent.title
                      )

                      void copy(eventUrl)
                    }}
                  >
                    {icon === "check" ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
                    Kopier lenke
                  </Button>
                )}

                {selectedEvent !== null && (
                  <Button element={Link} href={createEventPageUrl(selectedEvent.id, selectedEvent.title)}>
                    Åpne arrangementsiden
                    <IconArrowUpRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </DrawerHeader>

          <ScrollArea.Root
            key={selectedEvent?.id}
            data-vaul-no-drag
            type="auto"
            className="min-h-0 flex-1 overflow-hidden"
          >
            <ScrollArea.Viewport className="h-full w-full overscroll-contain">
              <div className="p-4">
                {selectedEvent !== null && <EventPreviewDetails key={selectedEvent.id} eventId={selectedEvent.id} />}
              </div>
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar orientation="vertical" className="flex w-2.5 touch-none select-none p-0.5">
              <ScrollArea.Thumb className="flex-1 rounded-full bg-gray-400/30 hover:bg-gray-400 dark:bg-stone-700 dark:hover:bg-stone-500 transition-colors" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </DrawerContent>
      </Drawer>
    </EventPreviewContext.Provider>
  )
}

function EventPreviewDetails({ eventId }: { eventId: string }) {
  const trpc = useTRPC()
  const { dbUser } = useAuthenticatedUser()

  const eventQuery = useQuery(trpc.event.find.queryOptions(eventId))

  const { data: parent = null } = useQuery(trpc.event.findParentEvent.queryOptions({ eventId }))

  const { data: isOrganizer } = useQuery({
    ...trpc.event.isOrganizer.queryOptions({ eventId }),
    enabled: dbUser !== null,
  })

  const { data: isAdmin } = useQuery({
    ...trpc.user.isAdmin.queryOptions(),
    enabled: dbUser !== null,
  })

  if (eventQuery.isLoading === true) {
    return <SkeletonEventHeader />
  }

  if (eventQuery.isError === true) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <Text>Kunne ikke laste arrangementet.</Text>
        <Button variant="outline" onClick={() => void eventQuery.refetch()}>
          Prøv igjen
        </Button>
      </div>
    )
  }

  const eventDetail = eventQuery.data ?? null

  if (eventDetail === null) {
    return <Text>Arrangementet finnes ikke eller er ikke tilgjengelig.</Text>
  }

  const { event, attendance } = eventDetail

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <EventHeader event={event} showAdminLink={isOrganizer === true || isAdmin === true} />

      <section aria-label="Arrangementsinformasjon" className="flex flex-col gap-4">
        {parent !== null && (
          <div className="rounded-xl border border-field-border p-3">
            <Title element="h2" size="sm">
              Arrangementet er en del av
            </Title>
            <EventListItem event={parent.event} attendance={parent.attendance} userId={dbUser?.id} />
          </div>
        )}

        <TimeBox event={event} showAddToCalendar={attendance === null} />
        <LocationBox event={event} />

        {event.hostingGroups.length > 0 || event.companies.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {event.hostingGroups.map((group) => (
              <OrganizerPill key={group.slug} item={group} />
            ))}

            {event.companies.map((company) => (
              <OrganizerPill key={company.id} item={company} />
            ))}
          </div>
        ) : (
          <Text className="text-muted-foreground">Ingen arrangører</Text>
        )}
      </section>

      {event.description !== "" && (
        <ReadMore maxLines={8}>
          <EventDescription description={event.description} />
        </ReadMore>
      )}

      {attendance !== null && (
        <AttendanceCard
          initialAttendance={attendance}
          initialRegistrationAvailability={null}
          parentEvent={parent?.event ?? null}
          user={dbUser}
          event={event}
        />
      )}
    </div>
  )
}
