import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next"
import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import { appRouter, createContextInner, transformer } from "@dotkomonline/api"
import { FC } from "react"
import { trpc } from "@/utils/trpc"
import { Button } from "@dotkomonline/ui"

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const { data: attendance } = trpc.event.getAttendance.useQuery({ eventId: props.event.id })
  const { mutate } = trpc.event.addAttendance.useMutation()

  return (
    <div>
      <h1>Event</h1>
      <pre>{JSON.stringify(props.event, null, 2)}</pre>
      <Button
        onClick={() =>
          mutate({
            start: new Date(),
            end: new Date(),
            deregisterDeadline: new Date(),
            eventId: props.event.id,
            limit: 20,
          })
        }
      >
        Add attendance group
      </Button>
      <h2>Attendance</h2>
      <pre>{JSON.stringify(attendance, null, 2)}</pre>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({
      session: null,
    }),
    transformer: transformer,
  })
  const events = await ssg.event.all.fetch()
  return {
    paths: events.map(({ id }) => ({ params: { id } })),
    fallback: "blocking",
  }
}

export const getStaticProps = async (ctx: GetStaticPropsContext<{ id: string }>) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({
      session: null,
    }),
    transformer: transformer,
  })
  const id = ctx.params?.id
  if (!id) {
    return { notFound: true }
  }
  const event = await ssg.event.get.fetch(id)

  return {
    props: {
      event,
    },
    revalidate: 86400,
  }
}

export default EventDetailPage
