import { auth } from "@/auth"
import { CompanySplash } from "@/components/molecules/CompanySplash/CompanySplash"
import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import { server } from "@/utils/trpc/server"
import type { AttendanceId, Event } from "@dotkomonline/types"
import { Button, Icon, Text, Tilt, Title } from "@dotkomonline/ui"
import { getCurrentUtc, slugify } from "@dotkomonline/utils"
import { formatDate, isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"

export default async function App() {
  const eventResult = await server.event.all.query({
    take: 3, filter: {
      byEndDate: {
        max: null,
        min: getCurrentUtc(),
      },
      orderBy: "asc",
    }
  })
  const events = eventResult.items
  const attendanceIds = events.map((event) => event.attendanceId).filter(Boolean) as AttendanceId[]

  const session = await auth.getServerSession()
  const user = session ? await server.user.getMe.query() : undefined

  const attendanceStatuses = user
    ? await server.attendance.getAttendeeStatuses.query({
      userId: user.id,
      attendanceIds,
    })
    : null

  return (
    <section className="flex flex-col gap-16 w-full">
      <ConstructionNotice />

      <CompanySplash />

      <div className="flex flex-col gap-4">
        <Title className="text-3xl font-semibold">Arrangementer</Title>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {events.map((event) => {
            const attendeeStatus = attendanceStatuses?.get(event.attendanceId ?? "") ?? null
            return <EventCard key={event.id} event={event} attendeeStatus={attendeeStatus} />
          })}

          <Tilt className="grow">
            <Button
              element="a"
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

const ConstructionNotice = () => {
  return (
    <div className="flex flex-col gap-0 bg-yellow-100 dark:bg-amber-100 dark:text-black rounded-2xl">
      <div className="flex flex-col gap-4 pt-5 px-5 pb-4 bg-yellow-200 dark:bg-amber-200 dark:text-black rounded-t-2xl">
        <Title className="text-lg md:text-xl font-bold">🚧 OW5 er under konstruksjon</Title>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6 pt-4 text-sm md:text-base rounded-b-2xl">
        <span className="inline-flex flex-row items-center gap-1">
          <Text>
            Vi jobber med å oppdatere{" "}
            <img
              src="/online-logo-o.svg"
              alt="Logo Online Linjeforening NTNU Trondheim"
              className="h-[1.75ch] w-[1.75ch] inline-block align-text-bottom"
            />{" "}
            OnlineWeb til en ny og bedre versjon. Det vil komme flere oppdateringer fremover, så følg med!
          </Text>
        </span>

        <span>
          <Text>
            Dersom du har tilbakemeldinger eller har funnet en feil, kan du sende en e-post til{" "}
            <Button
              variant="text"
              element="a"
              href="mailto:dotkom@online.ntnu.no"
              iconRight={<Icon icon="tabler:arrow-up-right" className="text-base" />}
              className="text-sm md:text-base font-semibold hover:bg-yellow-200 dark:text-black dark:hover:bg-amber-200"
            >
              dotkom@online.ntnu.no
            </Button>
          </Text>
        </span>
      </div>
    </div>
  )
}

interface ComingEventProps {
  event: Event
  attendeeStatus: "RESERVED" | "UNRESERVED" | null
}

const EventCard: FC<ComingEventProps> = ({ event, attendeeStatus }) => {
  return (
    <Link
      href={`/arrangementer/${slugify(event.title)}/${event.id}`}
      className="flex flex-col w-full gap-2 p-2 -m-2 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-stone-800"
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
            <Icon icon="tabler:calendar-event" className="text-gray-800 dark:text-stone-500" />
            <Text className="text-sm">{formatDate(event.start, "dd.MM")}</Text>
          </div>

          {event.attendanceId && (
            <AttendanceStatus
              attendanceId={event.attendanceId}
              attendeeStatus={attendeeStatus}
              eventEndInPast={isPast(event.start)}
            />
          )}
        </div>
      </div>
    </Link>
  )
}
