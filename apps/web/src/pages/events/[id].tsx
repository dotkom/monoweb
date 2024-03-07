import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"
import { type FC } from "react"
import { Button } from "@dotkomonline/ui"
import clsx from "clsx"
import { trpc } from "@/utils/trpc"
import { AttendanceGroup } from "./AttendanceGroup"
import { useSession } from ".."

interface StatusCardProps {
  title: string
  text: string
  background: string
}

// Biome ignores do not work in the middle of jsx so this is extracted just to igonre the rule here
//biome-ignore lint/security/noDangerouslySetInnerHtml: <We do not pass any user input into this, so it is safe>
const p = (text: string) => <p dangerouslySetInnerHTML={{ __html: text }} />

const StatusCard = ({ title, text, background }: StatusCardProps) => (
  <div className="mb-4">
    <div className={`block rounded-lg ${background} p-4 shadow-lg`}>
      <p className="text-lg font-bold">{title}</p>
      {p(text)}
    </div>
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
      return isRelative ? `Stengte for <strong>${value}</strong> siden` : `Stengte <strong>${value}</strong>`
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

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const { id: eventId } = props
  const { data: event } = trpc.event.get.useQuery(eventId)

  const attendanceId = event?.event.attendanceId
  const { data: attendance } = trpc.event.attendance.getAttendance.useQuery({
    id: attendanceId || "",
  })
  const { data: pools } = trpc.event.attendance.getPoolsByAttendanceId.useQuery({
    id: attendanceId || "",
  })

  const utils = trpc.useUtils()
  const unattendMutation = trpc.event.attendance.deregisterForEvent.useMutation({
    onSuccess: () => {
      utils.event.attendance.getPoolsByAttendanceId.invalidate({
        id: attendanceId || "",
      })
      utils.event.attendance.isAttending.invalidate({
        attendanceId: attendance?.id || "",
        userId: session.user.id,
      })
    },
  })
  const attendMutation = trpc.event.attendance.registerForEvent.useMutation({
    onSuccess: () => {
      utils.event.attendance.getPoolsByAttendanceId.invalidate({ id: attendanceId || "" })
      utils.event.attendance.isAttending.invalidate({
        attendanceId: attendance?.id || "",
        userId: session.user.id,
      })
    },
  })
  const session = useSession()

  const { data: selfAttendee } = trpc.event.attendance.isAttending.useQuery({
    attendanceId: attendance?.id || "",
    userId: session.user.id,
  })

  const STATUS = "OPEN"

  const inTenMinutes = new Date()
  inTenMinutes.setMinutes(inTenMinutes.getMinutes() + 10)

  const statusData = getStatusCardData(STATUS, inTenMinutes)

  const myGroups = pools?.find((a) => a.yearCriteria.includes(session.user.studyYear))
  const otherGroups = pools?.filter((group) => group.id !== myGroups?.id)

  const isAttending = Boolean(selfAttendee)

  const attend = () => {
    if (!session.user.id) {
      return
    }

    if (!attendance?.id) {
      return
    }

    attendMutation.mutate({
      attendanceId: attendance.id,
      userId: session.user.id,
    })
  }

  const unAttend = () => {
    if (!session.user.id) {
      return
    }

    if (!selfAttendee?.id) {
      return
    }

    unattendMutation.mutate({
      id: selfAttendee.id,
    })
  }

  return (
    <div>
      <div className="flex w-full">
        <div className="mr-10 w-[70%]">
          {/* Left column of page */}
          <h2>{event?.event.title}</h2>
          <p>{event?.event.description}</p>
        </div>
        <div className="flex flex-1 flex-col">
          {/* Right column of page */}
          <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
            <h2>Påmelding</h2>
            <div className="mt-2">
              <StatusCard {...statusData} />
            </div>
            <div>
              {myGroups && (
                <AttendanceGroup
                  title={"TODO: navn"}
                  numberOfPeople={myGroups.numAttendees}
                  totalSpots={myGroups.limit}
                  isAttending={isAttending}
                  canAttend={true}
                />
              )}
              {isAttending ? (
                <Button className="mt-2 w-full text-white" color="red" variant="solid" onClick={unAttend}>
                  Meld meg av
                </Button>
              ) : (
                <Button className="mt-2 w-full" onClick={attend}>
                  Meld meg på
                </Button>
              )}
            </div>

            {otherGroups?.length !== 0 && (
              <div className="mt-4">
                <p>Andre grupper med reserverte plasser</p>
                {otherGroups?.map((group, idx) => (
                  <AttendanceGroup
                    title={"1.-5. klasse"}
                    numberOfPeople={group.numAttendees}
                    totalSpots={group.limit}
                    key={group.id}
                    className={clsx(idx === 0 ? "mr-2" : "", "mt-4 w-32")}
                    isAttending={false}
                    canAttend={false}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
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
          <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
            <h2>Oppmøte</h2>
          </div>
        </div>
      </div>
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
