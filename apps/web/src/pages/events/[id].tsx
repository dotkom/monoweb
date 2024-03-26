import { trpc } from "@/utils/trpc"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"
import { Attendance, AttendancePool, Committee, Event } from "@dotkomonline/types"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next"
import { type FC } from "react"
import { type Session, useSession } from ".."
import { AttendanceBox } from "./components/AttendanceBox"
import { OrganizerBox } from "./components/OrganizerBox"
import { LocationBox } from "./components/LocationBox"
import { EventInfoBox } from "./components/EventInfoBox"

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const { user, isLoading: userIsLoading } = useSession()

  const { data: event, isLoading: eventIsLoading } = trpc.event.getWebEventDetailData.useQuery(props.id)

  if (eventIsLoading || userIsLoading) {
    return <div>Laster</div>
  }

  if (!event || !user) {
    return <div>Kunne ikke hente data</div>
  }

  if (event.hasAttendance) {
    return (
      <EventDetailWithAttendancePage
        user={user}
        attendance={event.attendance}
        pools={event.pools}
        event={event.event}
        committees={event.eventCommittees}
      />
    )
  }

  return <EventDetailWithoutAttendancePage user={user} event={event.event} committees={event.eventCommittees} />
}

interface WithoutAttendanceProps {
  user: NonNullable<Session["user"]>
  event: Event
  committees: Committee[]
}
const EventDetailWithoutAttendancePage: FC<WithoutAttendanceProps> = ({ user, event, committees }) => {
  return (
    <div>
      <div className="flex w-full">
        <EventInfoBox event={event} />
      </div>
    </div>
  )
}

interface WithAttendanceProps {
  user: NonNullable<Session["user"]>
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
  committees: Committee[]
}
const EventDetailWithAttendancePage: FC<WithAttendanceProps> = ({ user, attendance, pools, event, committees }) => {
  return (
    <div>
      <div className="flex w-full">
        <EventInfoBox event={event} />
        <div className="flex flex-1 flex-col">
          <AttendanceBox user={user} attendance={attendance} pools={pools} event={event} />
          {committees.length && <OrganizerBox committees={committees} />}
          {event.location && <LocationBox location={event.location} />}
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
  await helpers.event.getEventDetailData.prefetch(id)

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
    revalidate: 86400,
  }
}

export default EventDetailPage
