import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next"
import { appRouter, createContextInner, transformer } from "@dotkomonline/ow-gateway-trpc"

import { Committee } from "@dotkomonline/types"
import { CommitteeView } from "@/components/views/CommitteeView"
import { FC } from "react"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { trpc } from "@/utils/trpc"
import { useRouter } from "next/router"

const CommitteePage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const router = useRouter()
  const { id } = router.query as { id: string }

  const { data: eventsData, isLoading: isLoadingEvents } = trpc.event.allByCommittee.useQuery({ id })

  return <CommitteeView committee={props.committee} events={eventsData} isLoadingEvents={isLoadingEvents} />
}

export const getStaticPaths: GetStaticPaths = async () => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({
      auth: null,
    }),
    transformer: transformer,
  })
  const companies = await ssg.committee.all.fetch()
  return {
    paths: companies.map(({ id }) => ({ params: { id } })),
    fallback: "blocking",
  }
}

export const getStaticProps = async (ctx: GetStaticPropsContext<{ id: string }>) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({
      auth: null,
    }),
    transformer: transformer,
  })
  const id = ctx.params?.id
  if (!id) {
    return { notFound: true }
  }

  let committee: Committee
  try {
    committee = await ssg.committee.get.fetch(id)
  } catch (e) {
    return { notFound: true }
  }

  return {
    props: {
      committee,
    },
    revalidate: 86400,
  }
}

export default CommitteePage
