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
          <div className="flex flex-col md:grid md:[grid-template-columns:35%_35%_30%] md:[grid-template-rows:2fr_2fr_1fr] gap-6 w-full">
            <div className="col-span-2 row-span-3">
              <BigEventCard event={featuredEvent?.event} attendance={featuredEvent?.attendance} />
            </div>

            {otherEvents.map(({ event, attendance }) => (
              <EventCard key={event.id} event={event} attendance={attendance} userId={session?.sub ?? null} />
            ))}

            <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
              <Button
                element={Link}
                href="/arrangementer"
                className={cn(
                  "rounded-xl w-full h-full text-brand-800 hover:text-black md:gap-3",
                  "bg-blue-200 hover:bg-blue-100",
                  "dark:bg-brand dark:hover:bg-brand/75"
                )}
                iconRight={<Icon icon="tabler:arrow-up-right" className="md:text-2xl" />}
              >
                <Text className="md:text-xl">Se alle arrangementer</Text>
              </Button>
            </Tilt>
          </div>
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
}

const BigEventCard: FC<BigEventCardProps> = ({ event, attendance }) => {
  return (
    <Link
      href={`/arrangementer/${slugify(event.title)}/${event.id}`}
      className={cn(
        "flex flex-col w-full gap-5 p-3 rounded-xl transition-colors border",
        "border-gray-200 hover:bg-gray-50",
        "dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
      )}
    >
      <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
        <img
          src={event.imageUrl ? event.imageUrl : "/placeholder.svg"}
          alt={event.title}
          className="rounded-xl border border-gray-200 dark:border-stone-700 object-cover aspect-[16/9]"
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
            <RichText content={event.description} lineClamp="line-clamp-5" hideToggleButton />
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
}

const EventCard: FC<ComingEventProps> = ({ event, attendance, userId }) => {
  const reservedStatus = attendance?.attendees.find((attendee) => attendee.user.id === userId)?.reserved ?? null

  return (
    <Link
      href={`/arrangementer/${slugify(event.title)}/${event.id}`}
      className={cn(
        "flex flex-col h-full gap-3 p-3 border rounded-xl transition-colors",
        "border-gray-200 hover:bg-gray-50",
        "dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
      )}
    >
      <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
        <img
          src={event.imageUrl ? event.imageUrl : "/placeholder.svg"}
          alt={event.title}
          className="rounded-xl border border-gray-200 dark:border-stone-700 object-cover aspect-[16/9]"
        />
      </Tilt>
      <div className="flex flex-col gap-2 w-full">
        <Title element="p" size="lg" title={event.title} className="font-semibold line-clamp-1">
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
