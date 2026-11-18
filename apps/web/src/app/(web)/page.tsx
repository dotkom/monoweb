import { ArticleListItem } from "@/app/(web)/artikler/components/ArticleListItem"
import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import { ScrollingClouds } from "@/components/atoms/ScrollingClouds"
import { FrontPageOfflineShowcase } from "@/components/frontpage/FrontPageOfflineShowcase"
import { Link } from "@/components/link"
import { EventCard, type EventCardProps } from "@/components/molecules/EventListItem/EventCard"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { HorizontalScroller } from "@/components/molecules/HorizontalScroller"
import { OnlineHero } from "@/components/molecules/OnlineHero/OnlineHero"
import { OnlineHeroVisual } from "@/components/molecules/OnlineHero/OnlineHeroVisual"
import { AuthNotice } from "@/components/notices/auth-notice"
import { IdentityLinkSuccessNotice } from "@/components/notices/identity-link-success-notice"
import { IDENTITY_LINK_STATUS_COOKIE, IDENTITY_LINK_STATUS_VALUE } from "@/lib/link-identity-cookies"
import { server } from "@/utils/trpc/server"
import { TZDate } from "@date-fns/tz"
import type { EventRouter } from "@dotkomonline/rpc"
import { attendeeHasPendingCompletionDeadline, getAttendee } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import { Button, Text, Title, cn } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight, IconCalendarDollar, IconCalendarEvent } from "@tabler/icons-react"
import { formatDistanceToNowStrict, isFuture, startOfDay } from "date-fns"
import { nb } from "date-fns/locale"
import { cookies } from "next/headers"
import { CLOUD_ROWS } from "src/components/frontpage/FrontPageClouds"
import { VelkomEkskomLeaderApplicationsNotice } from "src/components/notices/smaller-committee-applications-notice"

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

const SeeAllButton = ({ label, href = "/arrangementer" }: { label: string; href?: string }) => (
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
  const cookieStore = await cookies()
  const isIdentityLinkSuccessVisible =
    cookieStore.get(IDENTITY_LINK_STATUS_COOKIE)?.value === IDENTITY_LINK_STATUS_VALUE

  const user = isIdentityLinkSuccessVisible ? null : await server.user.findMe.query()

  const startOfToday = startOfDay(new TZDate(getCurrentUTC(), "Europe/Oslo"))

  let userEvents: EventWithAttendanceSummary[] = []

  if (user !== null) {
    const { items } = await server.event.allSummariesByAttendingUserId.query({
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
    userEvents = items
  }

  const featuredEvents = await server.event.findFeaturedEvents.query({
    // With exactly one user event, one extra featured event is shown next to it as a suggestion
    limit: FEATURED_EVENT_COUNT + (userEvents.length === 1 ? 1 : 0),
    // Don't repeat events that are already shown under "Dine arrangementer"
    excludeAttendedByUser: user !== null,
  })

  const articles = await server.article.all.query({
    take: MOBILE_ARTICLE_COUNT,
  })
  const featuredOffline = await server.offline.findFeatured.query()

  const firstName = user?.name?.split(" ")[0]

  const now = getCurrentUTC()
  const suggestedEvent =
    userEvents.length === 1
      ? featuredEvents.find(
          (featured) => featured.attendance !== null && getAttendanceStatus(featured.attendance, now) === "OPEN"
        )
      : undefined
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
        {CLOUD_ROWS.map(({ top, width, duration, delay, opacity, hideInDarkMode }) => (
          <ScrollingClouds
            key={top}
            className={cn(top, hideInDarkMode && "dark:hidden")}
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

      {featuredOffline !== null && <FrontPageOfflineShowcase offline={featuredOffline} />}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Title className="text-3xl font-semibold">Artikler</Title>
          {articles.length > 0 && <SeeAllButton label="Se alle artikler" href="/artikler" />}
        </div>

        {articles.length > 0 ? (
          <>
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {articles.map((article) => (
                <div key={article.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-start">
                  <ArticleListItem article={article} orientation="vertical" />
                </div>
              ))}
            </div>

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
  events: EventWithAttendanceSummary[]
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
            <EventCard
              event={event}
              attendance={attendance}
              userId={userId}
              className="h-full bg-white hover:bg-gray-50 dark:bg-stone-800/50 dark:hover:bg-stone-800"
              header={<UserEventLabel event={event} attendance={attendance} userId={userId} />}
            />
          </div>
        ))}
        {suggestedEvent !== undefined && (
          <div className={cardClassName}>
            <EventCard
              event={suggestedEvent.event}
              attendance={suggestedEvent.attendance}
              userId={userId}
              className="h-full border-2 border-dashed border-blue-200 bg-white hover:border-blue-300 hover:bg-white/60 dark:border-stone-700 dark:bg-stone-800/50 dark:hover:border-stone-600 dark:hover:bg-stone-800/50"
              header={
                <Text className="w-fit rounded-lg bg-blue-100 px-3 py-1.5 text-base font-semibold text-blue-950 dark:bg-brand/30 dark:text-white">
                  Kanskje noe for deg?
                </Text>
              }
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
        <SeeAllButton label="Finn noe å bli med på" />
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
          {events.map(({ event, attendance }) => (
            <div
              key={event.id}
              // Three cards per view on desktop: (100% - 2 gaps of 1.5rem) / 3
              className="shrink-0 w-[85vw] max-w-[24rem] md:max-w-none md:w-[calc((100%-3rem)/3)] snap-start"
            >
              <EventCard
                event={event}
                attendance={attendance}
                className="bg-white hover:bg-gray-50 dark:bg-stone-800/50 dark:hover:bg-stone-800"
              />
            </div>
          ))}
        </HorizontalScroller>
      ) : (
        <EmptyState text="Det er ingen kommende arrangementer akkurat nå." />
      )}
    </div>
  )
}

function UserEventLabel({ event, attendance, userId }: Pick<EventCardProps, "event" | "attendance" | "userId">) {
  const attendee = getAttendee(attendance, userId ?? null)
  const paymentDeadline =
    attendance != null && attendeeHasPendingCompletionDeadline(attendance, attendee)
      ? attendee?.completionDeadline
      : null

  const label =
    paymentDeadline != null
      ? isFuture(paymentDeadline)
        ? `Betal innen ${formatDistanceToNowStrict(paymentDeadline, { locale: nb })}`
        : "Betalingsfristen er ute"
      : isFuture(event.start)
        ? `Om ${formatDistanceToNowStrict(event.start, { locale: nb })}`
        : "Pågår nå"

  const LabelIcon = paymentDeadline != null ? IconCalendarDollar : IconCalendarEvent

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit",
        paymentDeadline != null
          ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200"
          : "bg-blue-50 dark:bg-stone-900"
      )}
    >
      <LabelIcon className="size-5 shrink-0" />
      <Text className="text-base font-semibold">{label}</Text>
    </div>
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
