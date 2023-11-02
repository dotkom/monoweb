import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"
import { type Company } from "@dotkomonline/types"
import { type FC } from "react"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { useRouter } from "next/router"
import { trpc } from "@/utils/trpc"
import { CompanyView } from "@/components/views/CompanyView"

const CompanyPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const router = useRouter()
  const { id } = router.query as { id: string }

  const { data: eventsData, isLoading: isLoadingEvents } = trpc.event.allByCompany.useQuery({ id })

  return <CompanyView company={props.company} events={eventsData} isLoadingEvents={isLoadingEvents} />
}

export const getStaticPaths: GetStaticPaths = async () => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({
      auth: null,
    }),
    transformer,
  })
  const companies = await ssg.company.all.fetch()
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
    transformer,
  })
  const id = ctx.params?.id
  if (!id) {
    return { notFound: true }
  }

  let company: Company
  try {
    company = await ssg.company.get.fetch(id)
  } catch (e) {
    return { notFound: true }
  }

  return {
    props: {
      company,
    },
    revalidate: 86400,
  }
}

export default CompanyPage
