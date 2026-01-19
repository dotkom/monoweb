import { auth } from "@/auth"
import { PlaceHolderImage } from "@/components/atoms/PlaceHolderImage"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { OnlineHero } from "@/components/molecules/OnlineHero/OnlineHero"
import { JubileumNotice } from "@/components/notices/jubileum-notice"
import { server } from "@/utils/trpc/server"
import type { Attendance, Event, EventWithAttendance, UserId } from "@dotkomonline/types"
import { Button, RichText, Text, Tilt, Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl, getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight, IconCalendarEvent } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"
import { CommitteeApplicationsNotice } from "@/components/notices/committee-applications-notice"
import { TZDate } from "@date-fns/tz"

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

  return (
    <section className="flex flex-col gap-16 w-full">
      <div className="flex flex-col gap-6">
        <JubileumNotice />
        <CommitteeApplicationsNotice
          start={TZDate.tz("Europe/Oslo", "2026-01-19T00:00:00.000Z")}
          end={TZDate.tz("Europe/Oslo", "2026-01-26T23:59:00.000Z")}
        >
          <Title className="text-lg md:text-xl font-bold">Søk komité nå!</Title>
          <Text>
            Flere komiteer har våropptak, og de ser etter akkurat deg! <span className="font-semibold">Trykk her</span>{" "}
            for å gå til opptakssiden (opptak.online.ntnu.no).
          </Text>
        </CommitteeApplicationsNotice>
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
                    "rounded-xl w-full h-full min-h-24 text-brand-800 hover:text-black md:gap-3",
                    "bg-blue-200 hover:bg-blue-100",
                    "dark:bg-brand dark:hover:bg-brand/75"
                  )}
                  iconRight={<IconArrowRight className="size-5 md:w-6 md:h-6" />}
                >
                  <Text className="md:text-xl">Se alle</Text>
                </Button>
              </Tilt>
            </div>

            {/* mobile horizontal scroll */}
            <div className="md:hidden -mx-4">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                <div className="shrink-0 w-[85vw] max-w-[24rem] ml-4 snap-center">
                  <EventCard
                    event={featuredEvent?.event}
                    attendance={featuredEvent?.attendance}
                    userId={session?.sub ?? null}
                  />
                </div>

                {otherEvents.map(({ event, attendance }) => (
                  <div key={event.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-center">
                    <EventCard event={event} attendance={attendance} userId={session?.sub ?? null} />
                  </div>
                ))}

                <div className="snap-center pr-4">
                  <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005} className="h-full">
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
  const _reservedStatus = attendance?.attendees.find((attendee) => attendee.user.id === userId)?.reserved ?? null

  return (
    <Link
      href={createEventPageUrl(event.id, event.title)}
      className={cn(
        "flex flex-col w-full gap-5 p-6 rounded-2xl border transition-colors",
        "border-gray-100 bg-gray-50 hover:bg-transparent",
        "dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700",
        className
      )}
    >
      <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            className="rounded-lg border border-gray-100 dark:border-stone-700 object-cover aspect-video w-full"
            width={0}
            height={0}
          />
        ) : (
          <div className="rounded-lg border w-full border-gray-100 dark:border-stone-700 object-cover overflow-hidden aspect-video">
            <PlaceHolderImage variant={event.type} className="scale-160 object-contain" />
          </div>
        )}
      </Tilt>

      <div className="flex flex-col gap-3">
        <Title element="p" size="xl" className="text-xl line-clamp-1 max-md:font-medium md:text-4xl">
          {event.title}
        </Title>

        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 items-center">
            <IconCalendarEvent className="size-5 text-gray-500 dark:text-stone-500" />
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
  const _reservedStatus = attendance?.attendees.find((attendee) => attendee.user.id === userId)?.reserved ?? null

  return (
    <Link
      href={createEventPageUrl(event.id, event.title)}
      className={cn(
        "flex flex-col w-full h-fit gap-3 p-3 rounded-2xl border transition-colors",
        "border-gray-100 bg-gray-50 hover:bg-transparent",
        "dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700",
        className
      )}
    >
      <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            className="rounded-lg border border-gray-100 dark:border-stone-700 object-cover aspect-video w-full"
            width={0}
            height={0}
          />
        ) : (
          <div className="rounded-lg border w-full border-gray-100 dark:border-stone-700 object-cover overflow-hidden aspect-video">
            <PlaceHolderImage variant={event.type} className="scale-160 object-contain" />
          </div>
        )}
      </Tilt>
      <div className="flex flex-col gap-2 w-full">
        <Title element="p" size="lg" title={event.title} className="max-md:text-lg font-semibold line-clamp-1">
          {event.title}
        </Title>

        <div className="flex flex-row gap-2 items-center">
          <IconCalendarEvent className="size-5 text-gray-800 dark:text-stone-400" />
          <Text className="text-sm">{formatDate(event.start, "dd.MM", { locale: nb })}</Text>
        </div>
      </div>
    </Link>
  )
}

function _AttendancePaymentOopsNotice({
  userId,
  eventWithAttendance,
}: {
  userId: UserId | null
  eventWithAttendance: EventWithAttendance
}) {
  return (
    <div className="w-full p-6 text-white bg-red-600 rounded-2xl">
      <div className="flex flex-col gap-4 w-fit">
        <Text className="text-sm text-red-200">Oops. Dotkom har klusset med betaling igjen :(</Text>
        <Text className="text-2xl text-red-50 font-bold">Du må gjennomføre en betaling på nytt!</Text>

        <div className="bg-white dark:bg-stone-950 p-2 rounded-xl text-black dark:text-white">
          <EventListItem
            userId={userId}
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
