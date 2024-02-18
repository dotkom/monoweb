import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"
import { type FC } from "react"
import { Button } from "@dotkomonline/ui"
import clsx from "clsx"
import { AttendanceGroup } from "./AttendanceGroup"
import { useSessionWithDBUser } from ".."
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

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const { id } = props
  const { data: event } = trpc.event.get.useQuery(id)
  const { data: attendance } = trpc.event.attendance.get.useQuery({ eventId: id })
  const unattendMutation = trpc.event.attendance.deregisterForEvent.useMutation()
  const attendMutation = trpc.event.attendance.registerForEvent.useMutation()
  const user = useSessionWithDBUser()

  const STATUS = "OPEN"

  const inTenMinutes = new Date()
  inTenMinutes.setMinutes(inTenMinutes.getMinutes() + 10)

  const statusData = getStatusCardData(STATUS, inTenMinutes)

  // Range: [min, max)
  const groupIncludes = (min: number, max: number, group: number) => group < max && group >= min

  const myGroups = attendance?.find((a) => groupIncludes(a.min, a.max, user.user.studyYear ?? 100))
  const otherGroups = attendance?.filter((group) => !groupIncludes(group.min, group.max, user.user.studyYear ?? 100))

  const isUser = (attendee: { userId: string }) => attendee.userId === user.user.id
  const userInGroup = (group: { userId: string; attendanceId: string }[]) => group.find(isUser)

  const attendee = (myGroups !== undefined && userInGroup(myGroups.attendees)) || false

  const isAttending = Boolean(attendee)

  const attend = () => {
    if (!user.user.id) {
      return
    }

    if (!myGroups) {
      return
    }

    attendMutation.mutateAsync({ poolId: myGroups.id, userId: user.user.id })
  }

  const unAttend = () => {
    if (!attendee || !myGroups) {
      return
    }
    unattendMutation.mutateAsync({ attendanceId: myGroups?.id, userId: user.user.id || "" })
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
                  title={`${Math.max(1, myGroups.min)}-${myGroups.max - 1}. klasse`}
                  numberOfPeople={myGroups.attendees.length}
                  totalSpots={myGroups.limit}
                  isAttending={isAttending}
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
                <p>Andre grupper</p>
                {otherGroups?.map((group, idx) => (
                  <AttendanceGroup
                    title={"1.-5. klasse"}
                    numberOfPeople={group.attendees.length}
                    totalSpots={group.limit}
                    key={idx}
                    className={clsx(idx === 0 ? "mr-2" : "", "w-32")}
                    isAttending={false}
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
