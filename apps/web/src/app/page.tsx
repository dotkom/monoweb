import { auth } from "@/auth"
import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import { OnlineHero } from "@/components/molecules/OnlineHero/OnlineHero"
import { getEventUrl } from "@/utils/getEventUrl"
import { server } from "@/utils/trpc/server"
import type { Attendance, Event } from "@dotkomonline/types"
import { Button, Icon, Text, Tilt, Title } from "@dotkomonline/ui"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { formatDate, isFuture, isPast } from "date-fns"
import { cookies as getCookies } from "next/headers"
import Link from "next/link"
import type { FC } from "react"
import { ConstructionNotice } from "./construction-notice"

export default async function App() {
  const [session, isStaff] = await Promise.all([auth.getServerSession(), server.user.isStaff.query()])

  const { items } = await server.event.all.query({
    take: 5,
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

  // DELETE THIS
  const immballEvents = await server.event.all.query({
    filter: {
      byId: [
        "c03b4238-c83f-44d7-b56e-f013724e7252",
        "4964f685-ea8a-4280-89fa-f43338757b15",
      ],
    },
  })
  const immball = immballEvents.items.find(({ event, attendance }) =>
    attendance?.attendees.find((attendee) => {
      return (
        attendee.user.id === session?.sub &&
        !(attendee.paymentChargedAt || attendee.paymentRefundedAt) &&
        isFuture(event.start)
      )
    })
  )
  // END DELETE

  const cookies = await getCookies()
  const constructionNoticeShown = cookies.get("hide-construction-notice")?.value !== "1"

  return (
    <section className="flex flex-col gap-16 w-full">
      <div className="flex flex-col gap-4">
        {constructionNoticeShown && <ConstructionNotice />}
        {/* TODO: DELETE THIS */}
        {immball?.event && (
          <Link
            href={getEventUrl(immball.event.id, immball.event.title)}
            className="w-full p-6 text-white bg-red-500 rounded-2xl"
          >
            <div className="flex flex-col gap-0.5 w-fit">
              <Text className="text-lg font-semibold">
                Du må betale for immball igjen! Klikk her for å gå til arrangmentet.
              </Text>
              <Text className="text-sm">
                Du blir bare trukket én gang, selv om du tidligere har betalt.
                <br />
                Kontakt dotkom@online.ntnu.no og arrkom@online.ntnu.no dersom det oppstår problemer.
              </Text>
            </div>
          </Link>
        )}
        {/* END DELETE */}
        <OnlineHero />
      </div>

      <div className="flex flex-col gap-4">
        <Title className="text-3xl font-semibold">Arrangementer</Title>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map(({ event, attendance }) => {
            const reservedStatus =
              attendance?.attendees.find((attendee) => attendee.user.id === session?.sub)?.reserved ?? null

            return <EventCard key={event.id} event={event} attendance={attendance} reservedStatus={reservedStatus} />
          })}

          <Tilt className="grow">
            <Button
              element={Link}
              href="/arrangementer"
              className="w-full h-full bg-blue-100 hover:bg-blue-200 text-brand-800 hover:text-black"
              iconRight={<Icon icon="tabler:arrow-up-right" />}
            >
              <Text>Se alle arrangementer</Text>
            </Button>
          </Tilt>
        </div>
      </div>
    </section>
  )
}

interface ComingEventProps {
  event: Event
  attendance: Attendance | null
  reservedStatus: boolean | null
}

const EventCard: FC<ComingEventProps> = ({ event, attendance, reservedStatus }) => {
  return (
    <Link
      href={`/arrangementer/${slugify(event.title)}/${event.id}`}
      className="flex flex-col w-full gap-2 p-2 -m-2 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-stone-700"
    >
      <Tilt>
        <img
          src={event.imageUrl ? event.imageUrl : "/placeholder.svg"}
          alt={event.title}
          className="rounded-lg border border-gray-200 object-cover aspect-[4/3]"
        />
      </Tilt>
      <div className="flex flex-col gap-1">
        <Title element="p" size="sm" className="font-normal">
          {event.title}
        </Title>

        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row gap-2 items-center">
            <Icon icon="tabler:calendar-event" className="text-gray-800 dark:text-stone-400" />
            <Text className="text-sm">{formatDate(event.start, "dd.MM")}</Text>
          </div>

          {attendance && (
            <AttendanceStatus
              attendance={attendance}
              reservedStatus={reservedStatus}
              eventEndInPast={isPast(event.start)}
            />
          )}
        </div>
      </div>
    </Link>
  )
}
