import { PlaceHolderImage } from "@/components/atoms/PlaceHolderImage"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { AuthNotice } from "@/components/notices/auth-notice"
import { server } from "@/utils/trpc/server"
import { TZDate } from "@date-fns/tz"
import type { AttendanceSummary, BaseEvent, EventSummary, EventWithAttendanceSummary } from "@dotkomonline/types"
import { Button, RichText, Text, Tilt, Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl, getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight, IconCalendarEvent } from "@tabler/icons-react"
import { formatDate, startOfDay } from "date-fns"
import { nb } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

export default async function App() {
  const events = await server.event.findFeaturedEvents.query({
    limit: 2,
  })

  const featuredEvent = events[0] ?? null
  const otherEvents = events.slice(1)

  const user = await server.user.findMe.query()

  const startOfToday = startOfDay(new TZDate(getCurrentUTC(), "Europe/Oslo"))

  // Events the user is attending that ends today or later
  const eventsUserIsAttending = user
    ? (
        await server.event.allSummariesByAttendingUserId.query({
          id: user.id,
          take: 3,
          filter: {
            orderBy: "asc",
            byEndDate: {
              min: startOfToday,
              max: null,
            },
          },
        })
      ).items
    : []

  return (
    <section className="flex flex-col gap-16 w-full">
      <div className="flex flex-col gap-8">
        <AuthNotice />
        {/* DESKTOP SCREEN */}
        <div className="hidden md:grid md:grid-cols-[70%_30%] auto-rows-max w-full gap-6 pr-6">
          <div className="row-span-4 w-full h-full flex items-center justify-center">
            <Image
              src="/aprilfools-2026-barbietv.png"
              alt="April Fools"
              className="rounded-2xl object-cover w-full"
              width={0}
              height={0}
            />
          </div>

          <div className="invisible mb-24" />

          <EventCard event={featuredEvent?.event} attendance={featuredEvent?.attendance} />

          {otherEvents.map(({ event, attendance }) => (
            <EventCard key={event.id} event={event} attendance={attendance} />
          ))}

          <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005} className="h-full">
            <div className="flex justify-center items-center rounded-2xl w-full h-full min-h-24 bg-linear-to-r from-amber-700 via-50% via-amber-100 to-amber-700">
              <Button
                element={Link}
                href="/arrangementer"
                className={cn(
                  "rounded-xl w-[95%] h-[85%] text-white md:gap-3",
                  "bg-linear-to-t from-[#B8058B] to-[#FF46DD] hover:bg-blue-100 border border-amber-500"
                )}
                iconRight={<IconArrowRight className="size-5 md:w-6 md:h-6" />}
              >
                <Text className="md:text-xl">Se alle</Text>
              </Button>
            </div>
          </Tilt>
        </div>

        {/* MOBILE SCREEN */}
        <div className="md:hidden md:-mx-4 gap-8 flex flex-col">
          <Image
            src="/aprilfools-2026-barbietv.png"
            alt="April Fools"
            className="rounded-2xl object-cover w-full h-full"
            width={0}
            height={0}
          />
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
            <div className="shrink-0 w-[85vw] max-w-[24rem] md:ml-4 snap-center">
              <EventCard event={featuredEvent?.event} attendance={featuredEvent?.attendance} />
            </div>

            {otherEvents.map(({ event, attendance }) => (
              <div key={event.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-center">
                <EventCard event={event} attendance={attendance} />
              </div>
            ))}

            <div className="snap-center pr-4">
              <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005} className="h-full">
                <div className="flex items-center justify-center rounded-2xl h-full aspect-square mr-4 bg-linear-to-r from-amber-700 via-50% via-amber-100 to-amber-700">
                  <Button
                    element={Link}
                    href="/arrangementer"
                    className={cn(
                      "rounded-xl h-[95%] w-[95%] text-white aspect-square gap-2",
                      "bg-linear-to-t from-[#B8058B] to-[#FF46DD] border border-amber-500"
                    )}
                    iconRight={<IconArrowRight className="size-5 md:w-6 md:h-6" />}
                  >
                    <Text className="text-lg text-white">Se alle</Text>
                  </Button>
                </div>
              </Tilt>
            </div>
          </div>
        </div>
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
          <div>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {eventsUserIsAttending.map(({ event, attendance }) => (
                <div key={event.id} className="shrink-0 w-[85vw] max-w-[24rem] snap-center">
                  <EventCard event={event} attendance={attendance} />
                </div>
              ))}

              <div className="snap-center pr-4">
                <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005} className="h-full">
                  <div className="flex items-center justify-center rounded-2xl h-full aspect-square mr-4 bg-linear-to-r from-amber-700 via-50% via-amber-100 to-amber-700">
                    <Button
                      element={Link}
                      href="/arrangementer"
                      className={cn(
                        "rounded-xl h-[95%] w-[95%] text-white aspect-square gap-2",
                        "bg-linear-to-t from-[#B8058B] to-[#FF46DD] border border-amber-500"
                      )}
                      iconRight={<IconArrowRight className="size-5 md:w-6 md:h-6" />}
                    >
                      <Text className="text-lg">Se alle</Text>
                    </Button>
                  </div>
                </Tilt>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

interface BigEventCardProps {
  event: BaseEvent
  attendance: AttendanceSummary | null
  className?: string
}

// biome-ignore lint/correctness/noUnusedVariables: this card is unused for the pink theme
const BigEventCard: FC<BigEventCardProps> = ({ event, attendance, className }) => {
  const _reservedStatus = attendance?.currentUserAttendee?.reserved ?? false

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
  event: EventSummary
  attendance: AttendanceSummary | null
  className?: string
}

const EventCard: FC<ComingEventProps> = ({ event, attendance, className }) => {
  const _reservedStatus = attendance?.currentUserAttendee?.reserved ?? false

  return (
    <div className="flex items-center justify-center w-full h-full rounded-3xl bg-linear-to-r from-amber-700 via-50% via-amber-100 to-amber-700">
      <Link
        href={createEventPageUrl(event.id, event.title)}
        className={cn(
          "flex flex-col w-[95%] h-[95%] gap-3 p-5 rounded-2xl border border-amber-500 transition-colors",
          "bg-linear-to-t from-[#B8058B] to-[#FF46DD]",
          className
        )}
      >
        <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              className="rounded-lg border border-amber-500 object-cover aspect-video w-full"
              width={0}
              height={0}
            />
          ) : (
            <div className="rounded-lg border w-full border-amber-500 object-cover overflow-hidden aspect-video">
              <PlaceHolderImage variant={event.type} className="scale-160 object-contain" />
            </div>
          )}
        </Tilt>
        <div className="flex flex-col gap-2 w-full text-white">
          <Title element="p" size="lg" title={event.title} className="max-md:text-lg font-semibold line-clamp-1">
            {event.title}
          </Title>

          <div className="flex flex-row gap-2 items-center">
            <IconCalendarEvent className="size-5 text-white" />
            <Text className="text-sm">{formatDate(event.start, "dd.MM", { locale: nb })}</Text>
          </div>
        </div>
      </Link>
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
