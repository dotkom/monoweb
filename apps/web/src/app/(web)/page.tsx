import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import type { EventCardProps } from "@/components/molecules/EventListItem/EventCard"
import { EventImage } from "@/components/molecules/EventListItem/EventImage"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { OnlineHero } from "@/components/molecules/OnlineHero/OnlineHero"
import { OnlineHeroVisual } from "@/components/molecules/OnlineHero/OnlineHeroVisual"
import { AuthNotice } from "@/components/notices/auth-notice"
import { IdentityLinkSuccessNotice } from "@/components/notices/identity-link-success-notice"
import { IDENTITY_LINK_STATUS_COOKIE, IDENTITY_LINK_STATUS_VALUE } from "@/lib/link-identity-cookies"
import { cookies } from "next/headers"
import { server } from "@/utils/trpc/server"
import { TZDate } from "@date-fns/tz"
import { attendeeHasPendingCompletionDeadline, getAttendee } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import { Button, Text, Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl, getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight, IconCalendarDollar, IconCalendarEvent, IconMapPin } from "@tabler/icons-react"
import { formatDate, formatDistanceToNowStrict, isFuture, isPast, startOfDay } from "date-fns"
import { nb } from "date-fns/locale"
import { Link } from "@/components/link"

const SeAlleButton = ({ label = "Se alle", className }: { label?: string; className?: string }) => (
  <Button
    element={Link}
    href="/arrangementer"
    className={cn(
      "flex items-center gap-1.5 md:gap-2 h-8 md:h-9 rounded-lg px-2.5 md:px-3 text-sm md:text-base font-normal transition-colors",
      "text-black",
      "bg-blue-200 hover:bg-blue-100",
      "dark:bg-brand dark:hover:bg-brand/75 dark:text-white dark:hover:text-white",
      className
    )}
  >
    <span className="md:hidden">Se alle</span>
    <span className="hidden md:inline">{label}</span>
    <IconArrowRight className="size-4" />
  </Button>
)

const SeAlleTile = () => (
  <Link
    href="/arrangementer"
    className={cn(
      "flex items-center justify-center gap-2 h-full min-h-48 p-4 rounded-2xl text-center text-base md:text-xl transition-colors",
      "text-black bg-blue-200 hover:bg-blue-100",
      "dark:bg-brand dark:hover:bg-brand/75 dark:text-white"
    )}
  >
    Se alle arrangementer
    <IconArrowRight className="size-5 md:size-6" />
  </Link>
)

export default async function App() {
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

  let eventsUserIsAttending: Awaited<ReturnType<typeof server.event.allSummariesByAttendingUserId.query>>["items"] = []
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
  }

  const hasUserEvents = eventsUserIsAttending.length > 0

  let events: Awaited<ReturnType<typeof server.event.findFeaturedEvents.query>> = []
  try {
    events = await server.event.findFeaturedEvents.query({
      limit: user && !hasUserEvents ? 4 : 3,
    })
  } catch (e) {
    console.error("Failed to fetch featured events", e)
  }

  const firstName = user?.name?.split(" ")[0]

  return (
    <section className="flex flex-col gap-8 md:gap-16 w-full">
      <div className="flex flex-col gap-8 ">
        <AuthNotice />
        <IdentityLinkSuccessNotice initialVisible={showIdentityLinkSuccess} />
      </div>

      {!user ? (
        <>
          <OnlineHero />
          <FeaturedEvents events={events} />
        </>
      ) : (
        <div className={hasUserEvents ? "contents" : "flex flex-col gap-6"}>
          <div
            className={cn(
              "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-6",
              hasUserEvents ? "md:flex md:flex-row md:gap-8" : "md:grid-cols-3 md:items-start md:gap-6"
            )}
          >
            <div
              className={cn("max-md:contents flex flex-col gap-4 flex-1 min-w-0", !hasUserEvents && "md:col-span-2")}
            >
              <Title className="text-4xl font-bold max-md:col-start-1 max-md:row-start-1">
                {firstName ? `Hei, ${firstName}!` : "Hei!"}
              </Title>

              <div className="flex flex-col gap-4 min-w-0 max-md:col-span-2 max-md:row-start-2">
                {hasUserEvents ? (
                  <>
                    <Title className="text-1xl font-semibold">Dine arrangementer</Title>

                    <div className="hidden md:grid md:grid-cols-2 gap-4">
                      {eventsUserIsAttending.map(({ event, attendance }) => (
                        <UserEventCard key={event.id} event={event} attendance={attendance} userId={user?.id} />
                      ))}
                    </div>

                    <div className="md:hidden">
                      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                        {eventsUserIsAttending.map(({ event, attendance }) => (
                          <div key={event.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-center first:ml-0">
                            <UserEventCard event={event} attendance={attendance} userId={user?.id} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <FeaturedEvents
                    events={events.slice(0, 2)}
                    titleClassName="text-2xl"
                    showButton={events.length <= 2}
                    desktopGridClassName="md:grid-cols-2"
                  />
                )}
              </div>
            </div>

            <div
              className={cn(
                "w-40 shrink-0 max-md:col-start-2 max-md:row-start-1",
                hasUserEvents ? "md:w-2/5" : "md:w-full"
              )}
            >
              <OnlineHeroVisual />
            </div>
          </div>

          {hasUserEvents ? (
            <FeaturedEvents events={events} />
          ) : (
            events.length > 2 && <FeaturedEvents events={events.slice(2)} showTitle={false} showSeeAllTile />
          )}
        </div>
      )}
    </section>
  )
}

function FeaturedEvents({
  events,
  showTitle = true,
  showButton = true,
  showSeeAllTile = false,
  titleClassName,
  desktopGridClassName,
}: {
  events: Awaited<ReturnType<typeof server.event.findFeaturedEvents.query>>
  showTitle?: boolean
  showButton?: boolean
  showSeeAllTile?: boolean
  titleClassName?: string
  desktopGridClassName?: string
}) {
  return (
    <div className="flex flex-col gap-4">
      {(showTitle || (showButton && !showSeeAllTile)) && (
        <div className="flex items-center justify-between">
          {showTitle && (
            <Title className={cn("text-3xl font-semibold", titleClassName)}>Fremhevede arrangementer</Title>
          )}
          {showButton && !showSeeAllTile && events.length > 0 && (
            <SeAlleButton label="Se alle arrangementer" className="ml-auto" />
          )}
        </div>
      )}

      {events.length > 0 ? (
        <>
          {/* Desktop */}
          <div className={cn("hidden md:grid md:grid-cols-3 gap-6", desktopGridClassName)}>
            {events.map(({ event }) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
            {showSeeAllTile && <SeAlleTile />}
          </div>

          {/* Mobil */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {events.map(({ event }) => (
                <div key={event.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-center first:ml-0">
                  <FeaturedEventCard event={event} />
                </div>
              ))}
              {showSeeAllTile && (
                <div className="shrink-0 w-[40vw] max-w-[12rem] snap-center">
                  <SeAlleTile />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <Text className="text-gray-500 dark:text-stone-500">Det er ingen arrangementer å vise.</Text>
      )}
    </div>
  )
}

function UserEventCard({ event, attendance, userId }: EventCardProps) {
  const attendee = getAttendee(attendance, userId ?? null)
  const paymentDeadline =
    attendance && attendeeHasPendingCompletionDeadline(attendance, attendee) ? attendee?.completionDeadline : null

  const label = paymentDeadline
    ? isFuture(paymentDeadline)
      ? `Betal innen ${formatDistanceToNowStrict(paymentDeadline, { locale: nb })}`
      : "Betalingsfristen er ute"
    : isFuture(event.start)
      ? `Om ${formatDistanceToNowStrict(event.start, { locale: nb })}`
      : "Pågår nå"

  const LabelIcon = paymentDeadline ? IconCalendarDollar : IconCalendarEvent

  return (
    <Link href={createEventPageUrl(event.id, event.title)} className="group flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-stone-800">
        <LabelIcon className="size-5 shrink-0" />
        <Text className="text-base font-semibold">{label}</Text>
      </div>

      <EventImage
        imageUrl={event.imageUrl}
        alt={event.title}
        start={event.start}
        end={event.end}
        eventType={event.type}
        className="w-full min-w-0"
        imageClassName="aspect-video w-full"
        showBadge={false}
      />

      <div className="flex flex-col gap-1 min-w-0">
        <Title
          element="h3"
          size="lg"
          className="text-xl font-medium line-clamp-2 wrap-break-word text-gray-600 dark:text-stone-400"
        >
          {event.title}
        </Title>

        <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
          {attendance && (
            <AttendanceStatus attendance={attendance} attendee={attendee} eventEndInPast={isPast(event.end)} hideLock />
          )}

          {event.locationTitle && (
            <div className="flex flex-row items-center gap-2 min-w-0">
              <IconMapPin className="size-4 shrink-0 dark:text-stone-400" />
              <Text className="text-sm line-clamp-1 dark:text-stone-400">{event.locationTitle}</Text>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function FeaturedEventCard({ event }: { event: EventCardProps["event"] }) {
  return (
    <Link
      href={createEventPageUrl(event.id, event.title)}
      className={cn(
        "group flex flex-col gap-2 p-2 rounded-2xl transition-colors",
        "bg-gray-50 hover:bg-gray-100 dark:bg-stone-800/50 dark:hover:bg-stone-800"
      )}
    >
      <EventImage
        imageUrl={event.imageUrl}
        alt={event.title}
        start={event.start}
        end={event.end}
        eventType={event.type}
        className="w-full min-w-0"
        imageClassName="aspect-video w-full"
        showBadge={false}
      />
      <div className="flex flex-col px-1 pb-1">
        <Title element="h3" size="lg" className="text-xl font-medium line-clamp-2 wrap-break-word">
          {event.title}
        </Title>
        <Text className="text-sm">{formatDate(event.start, "d. MMMM", { locale: nb })}</Text>
      </div>
    </Link>
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
