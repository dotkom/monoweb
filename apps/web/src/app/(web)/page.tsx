import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import type { EventCardProps } from "@/components/molecules/EventListItem/EventCard"
import { EventImage } from "@/components/molecules/EventListItem/EventImage"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { OnlineHero } from "@/components/molecules/OnlineHero/OnlineHero"
import { OnlineHeroVisual } from "@/components/molecules/OnlineHero/OnlineHeroVisual"
import { HorizontalScroller } from "@/components/molecules/HorizontalScroller"
import { ScrollingClouds } from "@/components/atoms/ScrollingClouds"
import { AuthNotice } from "@/components/notices/auth-notice"
import { IdentityLinkSuccessNotice } from "@/components/notices/identity-link-success-notice"
import { IDENTITY_LINK_STATUS_COOKIE, IDENTITY_LINK_STATUS_VALUE } from "@/lib/link-identity-cookies"
import { cookies } from "next/headers"
import { server } from "@/utils/trpc/server"
import { TZDate } from "@date-fns/tz"
import type { EventRouter } from "@dotkomonline/rpc"
import { attendeeHasPendingCompletionDeadline, getAttendee } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import type { Offline } from "@dotkomonline/rpc/offline"
import { Button, Text, Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl, getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight, IconCalendarDollar, IconCalendarEvent, IconMapPin } from "@tabler/icons-react"
import { formatDate, formatDistanceToNowStrict, isAfter, isFuture, isPast, startOfDay } from "date-fns"
import { nb } from "date-fns/locale"
import { Link } from "@/components/link"

import { VelkomEkskomLeaderApplicationsNotice } from "src/components/notices/smaller-committee-applications-notice"
import { ArticleListItem } from "@/app/(web)/artikler/components/ArticleListItem"
import { FrontPageOfflineShowcase } from "@/components/frontPageOfflineShowcase"

type UserEvent = Awaited<ReturnType<typeof server.event.allSummariesByAttendingUserId.query>>["items"][number]

// Rows of clouds spread down the page. Different widths and speeds give a bit of depth.
// In dark mode only the bottom rows are shown, so the night sky has fewer clouds, low down.
const CLOUD_ROWS = [
  { top: "top-0", width: "w-[max(180vw,120rem)]", duration: "200s", delay: "0s", opacity: 1, hideAtNight: true },
  {
    top: "top-[20%]",
    width: "w-[max(220vw,140rem)]",
    duration: "260s",
    delay: "-130s",
    opacity: 0.8,
    hideAtNight: true,
  },
  {
    top: "top-[40%]",
    width: "w-[max(200vw,130rem)]",
    duration: "230s",
    delay: "-60s",
    opacity: 0.9,
    hideAtNight: true,
  },
  {
    top: "top-[60%]",
    width: "w-[max(240vw,150rem)]",
    duration: "280s",
    delay: "-200s",
    opacity: 0.75,
    hideAtNight: false,
  },
  {
    top: "top-[80%]",
    width: "w-[max(190vw,125rem)]",
    duration: "210s",
    delay: "-90s",
    opacity: 0.85,
    hideAtNight: false,
  },
] as const

const FEATURED_EVENT_COUNT = 9
// Mobile scrolls through more articles; desktop shows the first two side by side
const MOBILE_ARTICLE_COUNT = 6
const DESKTOP_ARTICLE_COUNT = 2
const USER_EVENT_LIMIT = 10

const seeAllColors = cn(
  "text-black bg-blue-200 hover:bg-blue-100 halloween:bg-gray-200 halloween:hover:bg-gray-100 halloween:text-foreground",
  "halloween:dark:bg-stone-700/60 halloween:dark:hover:bg-stone-700",
  "dark:bg-brand dark:hover:bg-brand/75 dark:text-white dark:hover:text-white"
)

const SeAlleButton = ({ label, href = "/arrangementer" }: { label: string; href?: string }) => (
  <Button
    element={Link}
    href={href}
    className={cn(
      "flex shrink-0 items-center gap-1.5 md:gap-2 h-8 md:h-9 rounded-lg px-2.5 md:px-3 text-sm md:text-base font-normal transition-colors",
      seeAllColors
    )}
  >
    <span className="md:hidden">Se alle</span>
    <span className="hidden md:inline">{label}</span>
    <IconArrowRight className="size-4" />
  </Button>
)

export default async function App() {
  let user: Awaited<ReturnType<typeof server.user.findMe.query>> = null
  const cookieStore = await cookies()
  const isIdentityLinkSuccessVisible =
    cookieStore.get(IDENTITY_LINK_STATUS_COOKIE)?.value === IDENTITY_LINK_STATUS_VALUE

  if (!isIdentityLinkSuccessVisible) {
    try {
      user = await server.user.findMe.query()
    } catch (error) {
      console.error("Failed to fetch user", error)
    }
  }

  const startOfToday = startOfDay(new TZDate(getCurrentUTC(), "Europe/Oslo"))

  let userEvents: UserEvent[] = []

  if (user !== null) {
    try {
      userEvents = (
        await server.event.allSummariesByAttendingUserId.query({
          id: user.id,
          take: USER_EVENT_LIMIT,
          filter: {
            orderBy: "asc",
            byEndDate: {
              min: startOfToday,
              max: null,
            },
          },
        })
      ).items
    } catch (error) {
      console.error("Failed to fetch user attending events", error)
    }
  }

  let featuredEvents: EventRouter.FindFeaturedEventsOutput = []

  try {
    featuredEvents = await server.event.findFeaturedEvents.query({
      // With exactly one user event, one extra featured event is shown next to it as a suggestion
      limit: FEATURED_EVENT_COUNT + (userEvents.length === 1 ? 1 : 0),
      // Don't repeat events that are already shown under "Dine arrangementer"
      excludeAttendedByUser: user !== null,
    })
  } catch (error) {
    console.error("Failed to fetch featured events", error)
  }

  let articles: Awaited<ReturnType<typeof server.article.all.query>> = []

  try {
    articles = await server.article.all.query({ take: MOBILE_ARTICLE_COUNT })
  } catch (error) {
    console.error("Failed to fetch articles", error)
  }

  let featuredOffline: Offline | undefined

  try {
    featuredOffline = (await server.offline.all.query())[0]
  } catch (error) {
    console.error("Failed to fetch offlines", error)
  }

  const firstName = user?.name?.split(" ")[0]

  const now = getCurrentUTC()
  const suggestedEvent =
    userEvents.length === 1 ? featuredEvents.find((featured) => canStillRegister(featured, now)) : undefined
  const remainingFeaturedEvents = featuredEvents
    .filter((featured) => featured !== suggestedEvent)
    .slice(0, FEATURED_EVENT_COUNT)

  return (
    <section data-front-page className="relative isolate flex flex-col gap-12 md:gap-16 w-full">
      {/* Clouds drifting across the whole background. ScrollingClouds switches to the dark clouds in dark mode */}
      <div
        aria-hidden
        className="absolute -top-28 -bottom-24 left-1/2 w-screen -translate-x-1/2 -z-10 overflow-hidden halloween:hidden"
      >
        {CLOUD_ROWS.map(({ top, width, duration, delay, opacity, hideAtNight }) => (
          <ScrollingClouds
            key={top}
            className={cn(top, hideAtNight && "dark:hidden")}
            imageClassName={width}
            duration={duration}
            delay={delay}
            style={{ opacity }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-8 empty:hidden">
        <AuthNotice />
        <IdentityLinkSuccessNotice initialVisible={isIdentityLinkSuccessVisible} />
        <VelkomEkskomLeaderApplicationsNotice
          start={TZDate.tz("Europe/Oslo", 2026, 9, 27, 12, 0, 0)}
          end={TZDate.tz("Europe/Oslo", 2026, 10, 1, 23, 59, 59)}
        />
      </div>

      <div data-homepage-opening className="contents">
        {user === null ? (
          <OnlineHero />
        ) : (
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-[3fr_2fr] items-center md:items-start gap-x-4 md:gap-x-10 gap-y-6">
            <Title className="text-4xl font-bold col-start-1 row-start-1 md:self-end">
              {firstName != null && firstName !== "" ? `Hei, ${firstName}!` : "Hei!"}
            </Title>

            <div className="w-40 md:w-full col-start-2 row-start-1 md:row-span-2 md:self-center">
              <OnlineHeroVisual />
            </div>

            <div className="col-span-2 md:col-span-1 md:col-start-1 md:row-start-2 min-w-0">
              {userEvents.length > 0 ? (
                <UserEvents events={userEvents} suggestedEvent={suggestedEvent} userId={user.id} />
              ) : (
                <NoUserEvents />
              )}
            </div>
          </div>
        )}

        <FeaturedEvents events={remainingFeaturedEvents} />
      </div>

      {featuredOffline !== undefined && <FrontPageOfflineShowcase offline={featuredOffline} />}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Title className="text-3xl font-semibold">Artikler</Title>
          {articles.length > 0 && <SeAlleButton label="Se alle artikler" href="/artikler" />}
        </div>

        {articles.length > 0 ? (
          <>
            {/* Mobil */}
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {articles.map((article) => (
                <div key={article.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-start">
                  <ArticleListItem article={article} orientation="vertical" />
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              {articles.slice(0, DESKTOP_ARTICLE_COUNT).map((article) => (
                <ArticleListItem key={article.id} article={article} orientation="horizontal" />
              ))}
            </div>
          </>
        ) : (
          <EmptyState text="Det er ingen artikler å vise." />
        )}
      </div>
    </section>
  )
}

/**
 * True if the event doesn't require registration, or if registration hasn't ended yet. Full events still count,
 * since joining the waiting list is a registration too.
 */
function canStillRegister({ attendance }: EventRouter.FindFeaturedEventsOutput[number], now: Date) {
  if (attendance === null || attendance.pools.length === 0) {
    return true
  }

  return isAfter(attendance.registerEnd, now)
}

function EmptyState({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-white dark:bg-stone-800/50">
      <Text className="text-gray-600 dark:text-stone-400">{text}</Text>
      {children}
    </div>
  )
}

function UserEvents({
  events,
  suggestedEvent,
  userId,
}: {
  events: UserEvent[]
  suggestedEvent?: EventRouter.FindFeaturedEventsOutput[number]
  userId: string
}) {
  // Two cards per view on desktop: (100% - 1 gap of 1.5rem) / 2
  const cardClassName = "shrink-0 w-[85vw] max-w-[24rem] md:max-w-none md:w-[calc((100%-1.5rem)/2)] snap-start"

  return (
    <div className="flex flex-col gap-4">
      <Title className="text-xl font-semibold">Dine arrangementer</Title>

      <HorizontalScroller>
        {events.map(({ event, attendance }) => (
          <div key={event.id} className={cardClassName}>
            <UserEventCard event={event} attendance={attendance} userId={userId} />
          </div>
        ))}
        {suggestedEvent !== undefined && (
          <div className={cardClassName}>
            <UserEventCard
              event={suggestedEvent.event}
              attendance={suggestedEvent.attendance}
              userId={userId}
              isSuggestion
            />
          </div>
        )}
      </HorizontalScroller>
    </div>
  )
}

function NoUserEvents() {
  return (
    <div className="flex flex-col gap-4">
      <Title className="text-xl font-semibold">Dine arrangementer</Title>
      <EmptyState text="Du er ikke påmeldt noen kommende arrangementer.">
        <SeAlleButton label="Finn noe å bli med på" />
      </EmptyState>
    </div>
  )
}

function FeaturedEvents({ events }: { events: EventRouter.FindFeaturedEventsOutput }) {
  return (
    <div data-featured-events className="flex flex-col gap-4">
      <Title className="text-3xl font-semibold">Fremhevede arrangementer</Title>

      {events.length > 0 ? (
        <HorizontalScroller>
          {events.map(({ event }) => (
            <div
              key={event.id}
              // Three cards per view on desktop: (100% - 2 gaps of 1.5rem) / 3
              className="shrink-0 w-[85vw] max-w-[24rem] md:max-w-none md:w-[calc((100%-3rem)/3)] snap-start"
            >
              <FeaturedEventCard event={event} />
            </div>
          ))}
        </HorizontalScroller>
      ) : (
        <EmptyState text="Det er ingen kommende arrangementer akkurat nå." />
      )}
    </div>
  )
}

function UserEventCard({
  event,
  attendance,
  userId,
  isSuggestion = false,
}: EventCardProps & { isSuggestion?: boolean }) {
  const attendee = getAttendee(attendance, userId ?? null)
  const paymentDeadline =
    attendance != null && attendeeHasPendingCompletionDeadline(attendance, attendee)
      ? attendee?.completionDeadline
      : null

  const label = isSuggestion
    ? "Kanskje noe for deg?"
    : paymentDeadline != null
      ? isFuture(paymentDeadline)
        ? `Betal innen ${formatDistanceToNowStrict(paymentDeadline, { locale: nb })}`
        : "Betalingsfristen er ute"
      : isFuture(event.start)
        ? `Om ${formatDistanceToNowStrict(event.start, { locale: nb })}`
        : "Pågår nå"

  // The suggestion label has no icon
  const LabelIcon = isSuggestion ? null : paymentDeadline != null ? IconCalendarDollar : IconCalendarEvent

  return (
    <Link
      href={createEventPageUrl(event.id, event.title)}
      className={cn(
        "group flex flex-col gap-3 p-2 rounded-2xl min-w-0 h-full transition-colors",
        isSuggestion
          ? // Dashed outline: "not yours yet", as opposed to the filled cards for events you're attending
            "border-2 border-dashed border-blue-200 hover:border-blue-300 hover:bg-white/60 dark:border-stone-700 dark:hover:border-stone-600 dark:hover:bg-stone-800/50"
          : "bg-white hover:bg-gray-50 dark:bg-stone-800/50 dark:hover:bg-stone-800"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit",
          isSuggestion
            ? "bg-blue-100 text-blue-950 dark:bg-brand/30 dark:text-white"
            : paymentDeadline != null
              ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200"
              : "bg-blue-50 dark:bg-stone-900"
        )}
      >
        {LabelIcon !== null && <LabelIcon className="size-5 shrink-0" />}
        <Text className="text-base font-semibold">{label}</Text>
      </div>

      <div className="flex flex-col gap-2 min-w-0">
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

        <div className="flex flex-col gap-2 px-1 pb-1 min-w-0">
          <Title element="h3" size="lg" className="text-xl font-medium line-clamp-2 wrap-break-word">
            {event.title}
          </Title>

          <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
            {attendance != null && (
              <AttendanceStatus
                attendance={attendance}
                attendee={attendee}
                eventEndInPast={isPast(event.end)}
                hideLock
              />
            )}

            {event.locationTitle != null && event.locationTitle !== "" && (
              <div className="flex flex-row items-center gap-2 min-w-0">
                <IconMapPin className="size-4 shrink-0 dark:text-stone-400" />
                <Text className="text-sm line-clamp-1 dark:text-stone-400">{event.locationTitle}</Text>
              </div>
            )}
          </div>
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
        "group flex flex-col gap-2 p-2 h-full rounded-2xl transition-colors",
        "bg-white hover:bg-gray-50 dark:bg-stone-800/50 dark:hover:bg-stone-800"
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
        <Text className="text-sm text-gray-600 dark:text-stone-400">
          {formatDate(event.start, "EEEE d. MMMM", { locale: nb })}
        </Text>
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
