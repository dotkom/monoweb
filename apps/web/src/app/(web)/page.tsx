import { EventCard } from "@/components/molecules/EventListItem/EventCard"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { OnlineHero } from "@/components/molecules/OnlineHero/OnlineHero"
import { AuthNotice } from "@/components/notices/auth-notice"
import { IdentityLinkSuccessNotice } from "@/components/notices/identity-link-success-notice"
import { IDENTITY_LINK_STATUS_COOKIE, IDENTITY_LINK_STATUS_VALUE } from "@/lib/link-identity-cookies"
import { cookies } from "next/headers"
import { server } from "@/utils/trpc/server"
import { TZDate } from "@date-fns/tz"
import { getAttendee } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import { Button, Text, Tilt, Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl, getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight } from "@tabler/icons-react"
import { format, startOfDay } from "date-fns"
import { nb } from "date-fns/locale"
import { Link } from "@/components/link"
import { TicketCarousel } from "@/components/TicketCarousel"
import type { TicketQRProps } from "@/components/TicketQR"

const TICKET_VISIBILITY_WINDOW_MS = 3 * 60 * 60 * 1000

export default async function App() {
  let events: Awaited<ReturnType<typeof server.event.findFeaturedEvents.query>> = []
  try {
    events = await server.event.findFeaturedEvents.query({
      limit: 2,
    })
  } catch (e) {
    console.error("Failed to fetch featured events", e)
  }

  let user: Awaited<ReturnType<typeof server.user.findMe.query>> = null
  const cookieStore = await cookies()
  const showIdentityLinkSuccess = cookieStore.get(IDENTITY_LINK_STATUS_COOKIE)?.value === IDENTITY_LINK_STATUS_VALUE

  if (!showIdentityLinkSuccess) {
    try {
      user = await server.user.findMe.query()
    } catch (e) {
      console.error("Failed to fetch user", e)
    }
  }

  const startOfToday = startOfDay(new TZDate(getCurrentUTC(), "Europe/Oslo"))
  const now = getCurrentUTC()

  let eventsUserIsAttending: Awaited<ReturnType<typeof server.event.allSummariesByAttendingUserId.query>>["items"] = []
  let eventsStartingSoon: Awaited<ReturnType<typeof server.event.allSummariesByAttendingUserId.query>>["items"] = []
  if (user) {
    try {
      eventsUserIsAttending = (
        await server.event.allSummariesByAttendingUserId.query({
          id: user.id,
          take: 2,
          filter: {
            orderBy: "asc",
            byEndDate: {
              min: startOfToday,
              max: null,
            },
          },
        })
      ).items
    } catch (e) {
      console.error("Failed to fetch user attending events", e)
    }

    try {
      eventsStartingSoon = (
        await server.event.allSummariesByAttendingUserId.query({
          id: user.id,
          take: 100,
          filter: {
            orderBy: "asc",
            byStartDate: {
              min: null,
              max: new Date(now.getTime() + TICKET_VISIBILITY_WINDOW_MS),
            },
            byEndDate: {
              min: now,
              max: null,
            },
          },
        })
      ).items
    } catch (e) {
      console.error("Failed to fetch soon-starting attended events", e)
    }
  }

  const tickets: TicketQRProps[] = eventsStartingSoon.flatMap(({ event, attendance }) => {
    const attendee = getAttendee(attendance, user)
    const millisecondsUntilStart = event.start.getTime() - now.getTime()
    if (
      !attendee?.registered ||
      millisecondsUntilStart > TICKET_VISIBILITY_WINDOW_MS ||
      event.end.getTime() < now.getTime()
    ) {
      return []
    }

    const start = new TZDate(event.start, "Europe/Oslo")
    const end = new TZDate(event.end, "Europe/Oslo")
    const eventHref = createEventPageUrl(event.id, event.title)

    return [
      {
        title: event.title,
        dateLabel: format(start, "d. MMMM yyyy", { locale: nb }),
        dateTime: event.start.toISOString(),
        schedule: format(start, "EEEE d. MMMM", { locale: nb }),
        time: `kl. ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
        month: format(start, "MMM", { locale: nb }).toLocaleUpperCase("nb-NO"),
        day: format(start, "dd"),
        location: event.locationTitle ?? "Sted ikke oppgitt",
        eventType: event.type,
        imageUrl: event.imageUrl ?? undefined,
        eventHref,
        locationHref: event.locationLink ?? eventHref,
        ticketValue: attendee.id,
      },
    ]
  })

  return (
    <section className="flex flex-col gap-16 w-full">
      <div className="flex flex-col gap-8">
        <AuthNotice />
        <IdentityLinkSuccessNotice initialVisible={showIdentityLinkSuccess} />
        <OnlineHero />
      </div>

      {tickets.length > 0 && <TicketCarousel tickets={tickets} />}

      <div className="flex flex-col gap-4">
        <Title className="text-3xl font-semibold">Arrangementer</Title>

        {events.length > 0 ? (
          <>
            <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr] gap-6 pr-6">
              {events.map(({ event, attendance }) => (
                <EventCard key={event.id} event={event} attendance={attendance} userId={user?.id} />
              ))}

              <Tilt
                tiltMaxAngleX={0.25}
                tiltMaxAngleY={0.25}
                scale={1.005}
                glareBorderRadius="var(--radius-xl)"
                className="h-full"
              >
                <Button
                  variant="unstyled"
                  element={Link}
                  href="/arrangementer"
                  className={cn(
                    "flex flex-row items-center gap-3 rounded-xl w-full h-full min-h-48 transition-colors",
                    "bg-gray-200 hover:bg-gray-100",
                    "dark:bg-stone-700/60 dark:hover:bg-stone-700"
                  )}
                >
                  <Text className="md:text-xl">Se alle</Text>
                  <IconArrowRight className="size-6" />
                </Button>
              </Tilt>
            </div>

            <div className="md:hidden md:-mx-4">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                {events.map(({ event, attendance }) => (
                  <div key={event.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-center first:ml-0">
                    <EventCard event={event} attendance={attendance} userId={user?.id} />
                  </div>
                ))}

                <div className="snap-center pr-4">
                  <Tilt
                    tiltMaxAngleX={0.25}
                    tiltMaxAngleY={0.25}
                    scale={1.005}
                    glareBorderRadius="var(--radius-xl)"
                    className="h-full"
                  >
                    <Button
                      element={Link}
                      href="/arrangementer"
                      className={cn(
                        "rounded-xl h-full min-h-48 aspect-square text-brand-800 hover:text-black gap-2 mr-4",
                        "bg-blue-200 hover:bg-blue-100",
                        "dark:bg-brand dark:hover:bg-brand/75"
                      )}
                      iconRight={<IconArrowRight className="size-5 md:w-6 md:h-6" />}
                    >
                      <Text className="text-lg">Se alle</Text>
                    </Button>
                  </Tilt>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Text className="text-gray-500 dark:text-stone-500">Det er ingen arrangementer å vise.</Text>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Title className="text-3xl font-semibold">Dine arrangementer</Title>

        {!user ? (
          <Text className="text-gray-500 dark:text-stone-500">Logg inn for å se arrangementer du er påmeldt.</Text>
        ) : eventsUserIsAttending.length === 0 ? (
          <Text className="text-gray-500 dark:text-stone-500">
            Du har ingen kommende arrangementer. Meld deg på et arrangement for å se det her!
          </Text>
        ) : (
          <>
            <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr] gap-6 pr-6">
              {eventsUserIsAttending.map(({ event, attendance }) => (
                <EventCard key={event.id} event={event} attendance={attendance} userId={user.id} />
              ))}

              <Tilt
                tiltMaxAngleX={0.25}
                tiltMaxAngleY={0.25}
                scale={1.005}
                glareBorderRadius="var(--radius-xl)"
                className="h-full"
              >
                <Button
                  variant="unstyled"
                  element={Link}
                  href="/arrangementer"
                  className={cn(
                    "flex flex-row items-center gap-3 rounded-xl w-full h-full min-h-48 transition-colors",
                    "bg-gray-200 hover:bg-gray-100",
                    "dark:bg-stone-700/60 dark:hover:bg-stone-700"
                  )}
                >
                  <Text className="md:text-xl">Se alle</Text>
                  <IconArrowRight className="size-6" />
                </Button>
              </Tilt>
            </div>

            <div className="md:hidden md:-mx-4">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                {eventsUserIsAttending.map(({ event, attendance }) => (
                  <div key={event.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-center first:ml-0">
                    <EventCard event={event} attendance={attendance} userId={user.id} />
                  </div>
                ))}

                <div className="snap-center pr-4">
                  <Tilt
                    tiltMaxAngleX={0.25}
                    tiltMaxAngleY={0.25}
                    scale={1.005}
                    glareBorderRadius="var(--radius-xl)"
                    className="h-full"
                  >
                    <Button
                      element={Link}
                      href="/arrangementer"
                      className={cn(
                        "rounded-xl h-full min-h-48 aspect-square text-brand-800 hover:text-black gap-2 mr-4",
                        "bg-blue-200 hover:bg-blue-100",
                        "dark:bg-brand dark:hover:bg-brand/75"
                      )}
                      iconRight={<IconArrowRight className="size-5 md:w-6 md:h-6" />}
                    >
                      <Text className="text-lg">Se alle</Text>
                    </Button>
                  </Tilt>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function _AttendancePaymentOopsNotice({ eventWithAttendance }: { eventWithAttendance: EventWithAttendanceSummary }) {
  return (
    <div className="w-full p-6 text-white bg-red-600 rounded-2xl">
      <div className="flex flex-col gap-4 w-fit">
        <Text className="text-sm text-red-200">Oops. Dotkom har klusset med betaling igjen :(</Text>
        <Text className="text-2xl text-red-50 font-bold">Du må gjennomføre en betaling på nytt!</Text>

        <div className="bg-white dark:bg-stone-950 p-2 rounded-xl text-black dark:text-white">
          <EventListItem
            event={eventWithAttendance.event}
            attendance={eventWithAttendance.attendance}
            className="-mt-2"
          />
        </div>

        <Text className="text-sm text-red-200">
          Du skal bare trukket <span className="underline">én</span> gang! Selv om du tidligere har betalt.
          <br />
          Dersom du allerede har blitt trukket fra kontoen eller har et beløp reservert og ser denne meldingen, ta
          kontakt.
        </Text>
        <Text className="text-sm text-red-200">
          Kontakt dotkom@online.ntnu.no og arrangør dersom det oppstår problemer.
        </Text>
      </div>
    </div>
  )
}
