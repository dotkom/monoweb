import { GetStaticPaths, GetStaticProps, GetStaticPropsContext, InferGetStaticPropsType } from "next"
import { useRouter } from "next/router"
import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import { appRouter, createContextInner, transformer } from "@dotkomonline/api"
import { RouterOutputs } from "@/utils/trpc"
import { FC } from "react"

type Event = RouterOutputs["event"]["get"]

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  return <div>{JSON.stringify(props, null, 2)}</div>
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
  await ssg.event.get.fetch(id)

  return {
    props: {
      trpcState: ssg.dehydrate,
    },
    revalidate: 3600,
  }
}

export default EventDetailPage
