import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"
import { type FC } from "react"
import { Button } from "@dotkomonline/ui"
// import PortableText from "../../components/molecules/PortableText"
import clsx from "clsx"
import { trpc } from "@/utils/trpc"

interface StatusCardProps {
  title: string
  text: string
  background: string
}

const StatusCard = ({ title, text, background }: StatusCardProps) => (
  <div className="mb-4">
    <div className={`block rounded-lg ${background} p-4 shadow-lg`}>
      <p className="text-lg font-bold">{title}</p>
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  </div>
)

interface AttendanceGroupProps {
  title: string
  numberOfPeople: number
  totalSpots: number
  className?: string
}

const AttendanceGroup = ({ title, numberOfPeople, totalSpots, className }: AttendanceGroupProps) => (
  <div className={clsx("bg-slate-4 rounded-lg p-4", className)}>
    <p className="text-center text-sm font-bold">{title}</p>
    <p className="mt-1 text-center text-lg font-semibold">
      {numberOfPeople}/{totalSpots}
    </p>
  </div>
)

type StatusState = "CLOSED" | "NOT_OPENED" | "OPEN"

const STATUS_STATE_COLOR: { [key in StatusState]: `bg-${string}-4` } = {
  NOT_OPENED: "bg-red-4",
  OPEN: "bg-green-4",
  CLOSED: "bg-purple-4",
}

const STATUS_TEXTS: { [key in StatusState]: { title: string } } = {
  OPEN: { title: "Åpen" },
  NOT_OPENED: { title: "Ikke åpnet" },
  CLOSED: { title: "Stengt" },
}

interface DateString {
  value: string
  isRelative: boolean
}

// todo: move out of file
const dateToString = (attendanceOpeningDate: Date): DateString => {
  // todo: move out of scope
  const THREE_DAYS_MS = 259_200_000
  const ONE_DAY_MS = 86_400_000
  const ONE_HOUR_MS = 3_600_000
  const ONE_MINUTE_MS = 60_000
  const ONE_SECOND_MS = 1_000

  const now = new Date().getTime()
  const dateDifference = attendanceOpeningDate.getTime() - now

  if (Math.abs(dateDifference) > THREE_DAYS_MS) {
    const formatter = new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "long",
      weekday: "long",
    })

    // "mandag 12. april"
    const value = formatter.format(attendanceOpeningDate)

    return { value, isRelative: false }
  }

  const days = Math.floor(Math.abs(dateDifference) / ONE_DAY_MS)
  const hours = Math.floor((Math.abs(dateDifference) % ONE_DAY_MS) / ONE_HOUR_MS)
  const minutes = Math.floor((Math.abs(dateDifference) % ONE_HOUR_MS) / ONE_MINUTE_MS)
  const seconds = Math.floor((Math.abs(dateDifference) % ONE_MINUTE_MS) / ONE_SECOND_MS)

  let value = "nå"

  if (days > 0) {
    value = `${days} dag${days === 1 ? "" : "er"}`
  } else if (hours > 0) {
    value = `${hours} time${hours === 1 ? "" : "r"}`
  } else if (minutes > 0) {
    value = `${minutes} minutt${minutes === 1 ? "" : "er"}`
  } else if (seconds > 0) {
    value = `${seconds} sekund${seconds === 1 ? "" : "er"}`
  }

  return { value, isRelative: true }
}

const getStatusDate = (date: Date, status: StatusState): string => {
  const { value, isRelative } = dateToString(date)

  switch (status) {
    case "NOT_OPENED":
      return isRelative ? `Åpner om <strong>${value}</strong>` : `Åpner <strong>${value}</strong>`
    case "OPEN":
      return isRelative ? `Stenger om <strong>${value}</strong>` : `Stenger <strong>${value}</strong>`
    case "CLOSED":
      return isRelative ? `Stengte for <strong>${value}</strong> siden` : `Stengte $<strong>{value}</strong>`
    default:
      return "ukjent"
  }
}

const getStatusCardData = (status: StatusState, datetime: Date): StatusCardProps => {
  const { title } = STATUS_TEXTS[status]

  return {
    title,
    text: getStatusDate(datetime, status),
    background: STATUS_STATE_COLOR[status],
  }
}

const BITFIELD = {
  "1": 1 << 0,
  "2": 1 << 1,
  "3": 1 << 2,
  "4": 1 << 3,
  "5": 1 << 4,
  "sosial medlem": 1 << 5,
}

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const { id } = props
  const { data: event } = trpc.event.get.useQuery(id)
  const { data: attendance } = trpc.event.attendance.get.useQuery({ eventId: id })
  const { mutate: addAttendance } = trpc.event.attendance.create.useMutation()
  const { mutate: attendEvent } = trpc.event.attendance.attend.useMutation()
  const utils = trpc.useContext()

  const STATUS = "OPEN"

  const inTenMinutes = new Date()
  inTenMinutes.setMinutes(inTenMinutes.getMinutes() + 10)

  const statusData = getStatusCardData(STATUS, inTenMinutes)

  return (
    <div>
      <div className="flex">
        <div>
          {/* Left column of page */}
          <h2>{event?.event.title}</h2>
          {/* <PortableText blocks={event?.event.description ?? ""} /> */}
          <p>{event?.event.description}</p>
        </div>
        <div className="flex flex-col">
          {/* Right column of page */}
          <div className="border-slate-5 min-h-64 mb-8 min-w-[400px] border px-4 py-8">
            <h2>Påmelding</h2>
            <div className="mt-2">
              <StatusCard {...statusData} />
            </div>
            <div className="flex">
              {attendance?.map((group, idx) => (
                <AttendanceGroup
                  title={"1.-5. klasse"}
                  numberOfPeople={group.attendees.length}
                  totalSpots={group.max}
                  key={idx}
                  className={idx === 0 ? "mr-2" : ""}
                />
              ))}
            </div>
          </div>

          <div className="border-slate-5 min-h-64 mb-8 min-w-[400px] border px-4 py-8">
            <h2>Arrangør</h2>
            <table className="mx-auto mt-4">
              <tbody>
                <tr>
                  <td className="p-4">Navn</td>
                  <td className="p-4">{event?.eventCommittees[0].name}</td>
                </tr>
                <tr>
                  <td className="p-4">Epost</td>
                  <td className="p-4">{event?.eventCommittees[0].email}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="border-slate-5 min-h-64 mb-8 min-w-[400px] border px-4 py-8">
            <h2>Oppmøte</h2>
            {/* practical information about where to meet */}
          </div>
        </div>
      </div>

      <pre>{JSON.stringify(event, null, 2)}</pre>
      <Button
        onClick={async () => {
          addAttendance({
            start: new Date(),
            end: new Date(),
            deregisterDeadline: new Date(),
            eventId: id,
            limit: 20,
            min: 1,
            max: 5,
          })
          utils.event.attendance.get.invalidate()
        }}
      >
        Add attendance group
      </Button>
      <Button
        onClick={async () => {
          attendEvent({
            eventId: id,
          })
          utils.event.attendance.get.invalidate()
        }}
      >
        Join random group
      </Button>
      <h2>Attendance</h2>
      <pre>{JSON.stringify(attendance, null, 2)}</pre>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({
      auth: null,
    }),
    transformer, // optional - adds superjson serialization
  })

  const events = await helpers.event.all.fetch()
  return {
    paths: events.map(({ id }) => ({ params: { id } })),
    fallback: "blocking",
  }
}

export const getStaticProps = async (ctx: GetStaticPropsContext<{ id: string }>) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({
      auth: null,
    }),
    transformer, // optional - adds superjson serialization
  })

  const id = ctx.params?.id
  if (!id) {
    return { notFound: true }
  }
  await helpers.event.get.prefetch(id)

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
    revalidate: 86400,
  }
}

export default EventDetailPage
