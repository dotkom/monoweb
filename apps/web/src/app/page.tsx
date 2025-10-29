import { auth } from "@/auth"
import { OnlineHero } from "@/components/molecules/OnlineHero/OnlineHero"
import { server } from "@/utils/trpc/server"
import type { Attendance, Event } from "@dotkomonline/types"
import { RichText, cn } from "@dotkomonline/ui"
import { Icon, Text, Tilt, Title } from "@dotkomonline/ui"
import { Button } from "@dotkomonline/ui"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import { cookies as getCookies } from "next/headers"
import Link from "next/link"
import type { FC } from "react"
import { ConstructionNotice } from "./construction-notice"

export default async function App() {
  const [session, isStaff] = await Promise.all([auth.getServerSession(), server.user.isStaff.query()])

  const { items: events } = await server.event.all.query({
    take: 3,
    filter: {
      byEndDate: {
        max: null,
        min: getCurrentUTC(),
      },
      excludingOrganizingGroup: ["velkom"],
      excludingType: isStaff ? [] : undefined,
      orderBy: "asc",
    },
  })

  const featuredEvent = events[0] ?? null
  const otherEvents = events.slice(1)

  const cookies = await getCookies()
  const constructionNoticeShown = cookies.get("hide-construction-notice")?.value !== "1"

  return (
    <section className="flex flex-col gap-16 w-full">
      <div className="flex flex-col gap-4">
        {constructionNoticeShown && <ConstructionNotice />}
        <OnlineHero />
      </div>

      <div className="flex flex-col gap-4">
        <Title className="text-3xl font-semibold">Arrangementer</Title>

        {featuredEvent ? (
          <>
            {/* desktop grid layout */}
            <div className="hidden md:grid md:grid-cols-[70%_30%] auto-rows-max w-full gap-6 pr-6">
              <BigEventCard
                event={featuredEvent?.event}
                attendance={featuredEvent?.attendance}
                userId={session?.sub ?? null}
                className="row-span-3"
              />

              {otherEvents.map(({ event, attendance }) => (
                <EventCard key={event.id} event={event} attendance={attendance} userId={session?.sub ?? null} />
              ))}

              <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005} className="h-full">
                <Button
                  element={Link}
                  href="/arrangementer"
                  className={cn(
                    "rounded-xl w-full h-full min-h-[6rem] text-brand-800 hover:text-black md:gap-3",
                    "bg-blue-200 hover:bg-blue-100",
                    "dark:bg-brand dark:hover:bg-brand/75"
                  )}
                  iconRight={<Icon icon="tabler:arrow-right" className="md:text-2xl" />}
                >
                  <Text className="md:text-xl">Se alle</Text>
                </Button>
              </Tilt>
            </div>

            {/* mobile horizontal scroll */}
            <div className="md:hidden -mx-4">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                <div className="flex-shrink-0 w-[85vw] max-w-[24rem] ml-4 snap-center">
                  <EventCard
                    event={featuredEvent?.event}
                    attendance={featuredEvent?.attendance}
                    userId={session?.sub ?? null}
                  />
                </div>

                {otherEvents.map(({ event, attendance }) => (
                  <div key={event.id} className="flex-shrink-0 w-[85vw] max-w-[24rem] snap-center">
                    <EventCard event={event} attendance={attendance} userId={session?.sub ?? null} />
                  </div>
                ))}

                <div className="snap-center pr-4">
                  <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005} className="h-full">
                    <Button
                      element={Link}
                      href="/arrangementer"
                      className={cn(
                        "rounded-xl h-full min-h-[12rem] aspect-square text-brand-800 hover:text-black gap-2 mr-4",
                        "bg-blue-200 hover:bg-blue-100",
                        "dark:bg-brand dark:hover:bg-brand/75"
                      )}
                      iconRight={<Icon icon="tabler:arrow-right" className="text-xl" />}
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
    </section>
  )
}

interface BigEventCardProps {
  event: Event
  attendance: Attendance | null
  userId: string | null
  className?: string
}

const BigEventCard: FC<BigEventCardProps> = ({ event, attendance, userId, className }) => {
  const reservedStatus = attendance?.attendees.find((attendee) => attendee.user.id === userId)?.reserved ?? null

  return (
    <Link
      href={`/arrangementer/${slugify(event.title)}/${event.id}`}
      className={cn(
        "flex flex-col w-full gap-5 p-6 rounded-2xl border transition-colors",
        "border-gray-100 bg-gray-50 hover:bg-transparent",
        "dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700",
        className
      )}
    >
      <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
        <img
          src={event.imageUrl ? event.imageUrl : "/placeholder.svg"}
          alt={event.title}
          className="rounded-lg border border-gray-100 dark:border-stone-700 object-cover aspect-[16/9]"
        />
      </Tilt>

      <div className="flex flex-col gap-3">
        <Title element="p" size="xl" className="text-xl line-clamp-1 max-md:font-medium md:text-4xl">
          {event.title}
        </Title>

        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 items-center">
            <Icon icon="tabler:calendar-event" className="text-xl text-gray-500 dark:text-stone-500" />
            <Text className="text-lg">{formatDate(event.start, "dd. MMM", { locale: nb })}</Text>
          </div>
          <div className="max-md:hidden">
            <RichText content={event.description} maxLines={5} hideToggleButton className="h-32" />
          </div>
        </div>
      </div>
    </Link>
  )
}

interface ComingEventProps {
  event: Event
  attendance: Attendance | null
  userId: string | null
  className?: string
}

const EventCard: FC<ComingEventProps> = ({ event, attendance, userId, className }) => {
  const reservedStatus = attendance?.attendees.find((attendee) => attendee.user.id === userId)?.reserved ?? null

  return (
    <Link
      href={`/arrangementer/${slugify(event.title)}/${event.id}`}
      className={cn(
        "flex flex-col w-full h-fit gap-3 p-3 rounded-2xl border transition-colors",
        "border-gray-100 bg-gray-50 hover:bg-transparent",
        "dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700",
        className
      )}
    >
      <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
        <img
          src={event.imageUrl ? event.imageUrl : "/placeholder.svg"}
          alt={event.title}
          className="rounded-lg border border-gray-200 dark:border-stone-700 object-cover aspect-[16/9]"
        />
      </Tilt>
      <div className="flex flex-col gap-2 w-full">
        <Title element="p" size="lg" title={event.title} className="max-md:text-lg font-semibold line-clamp-1">
          {event.title}
        </Title>

        <div className="flex flex-row gap-2 items-center">
          <Icon icon="tabler:calendar-event" className="text-base text-gray-800 dark:text-stone-400" />
          <Text className="text-sm">{formatDate(event.start, "dd.MM", { locale: nb })}</Text>
        </div>
      </div>
    </Link>
  )
}
