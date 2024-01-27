import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"
import { type FC } from "react"
import { Button } from "@dotkomonline/ui"
// import PortableText from "../../components/molecules/PortableText"
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
      <p>{text}</p>
    </div>
  </div>
)

type StatusState = "CLOSED" | "NOT_OPENED" | "OPEN"

const STATUS_STATE_COLOR: { [key in StatusState]: `bg-${string}-4` } = {
  NOT_OPENED: "bg-red-4",
  OPEN: "bg-green-4",
  CLOSED: "bg-purple-4",
}

const STATUS_TEXTS: { [key in StatusState]: { title: string; textPrefix: string } } = {
  OPEN: { title: "Åpen", textPrefix: "Stenger om" },
  NOT_OPENED: { title: "Ikke åpnet", textPrefix: "Åpner om" },
  CLOSED: { title: "Stengt", textPrefix: "Stengte for" },
}

const getStatusCardData = (status: StatusState, datetime: Date): StatusCardProps => {
  const { title, textPrefix } = STATUS_TEXTS[status]

  return {
    title,
    text: `${textPrefix} ${timeLeft} døgn`,
    background: STATUS_STATE_COLOR[status],
  }
}

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const { id } = props
  const { data: event } = trpc.event.get.useQuery(id)
  const { data: attendance } = trpc.event.attendance.get.useQuery({ eventId: id })
  const { mutate: addAttendance } = trpc.event.attendance.create.useMutation()
  const { mutate: attendEvent } = trpc.event.attendance.attend.useMutation()
  const utils = trpc.useContext()

  const STATUS = "OPEN"
  const statusData = getStatusCardData(STATUS, "2")

  return (
    <div>
      <h1>Event</h1>
      <div className="flex">
        <div>
          {/* Left column of page */}
          <h2>{event?.event.title}</h2>
          {/* <PortableText blocks={event?.event.description ?? ""} /> */}
          <p>{event?.event.description}</p>
        </div>
        <div>
          {/* Right column of page */}
          <div className="border-b-slate-9 h-64 w-64 border-2 ">
            <h2>Påmelding</h2>
            <StatusCard {...statusData} />
            Antall grupper: {attendance?.length}
          </div>
          <div className="border-b-slate-9 h-64 w-64 border-2 ">
            <h2>Oppmøte</h2>
            {/* practical information about where to meet */}
          </div>
          <div className="border-b-slate-9 h-64 w-64 border-2 ">
            <h2>Arrangør</h2>
            {/* Organizer information */}
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
