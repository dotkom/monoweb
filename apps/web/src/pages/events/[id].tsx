import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter, createContextInner, transformer } from "@dotkomonline/api"
import { FC } from "react"
import { trpc } from "@/utils/trpc"
import { Button } from "@dotkomonline/ui"

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const { id } = props
  const { data } = trpc.event.get.useQuery(id)
  const { data: attendance } = trpc.event.attendance.get.useQuery({ eventId: id })
  const { mutate: addAttendance } = trpc.event.attendance.add.useMutation()
  const { mutate: attendEvent } = trpc.event.attendance.attend.useMutation()
  const utils = trpc.useContext()

  return (
    <div>
      <h1>Event</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button
        onClick={async () => {
          await addAttendance({
            start: new Date(),
            end: new Date(),
            deregisterDeadline: new Date(),
            eventId: id,
            limit: 20,
          })
          utils.event.attendance.get.invalidate()
        }}
      >
        Add attendance group
      </Button>
      <Button
        onClick={async () => {
          await attendEvent({
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
