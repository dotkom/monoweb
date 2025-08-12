import { useEventAllInfiniteQuery } from "@/app/arrangementer/components/queries"
import { CompanyView } from "@/components/views/CompanyView"
import { useTRPC } from "@/utils/trpc/client"
import { server } from "@/utils/trpc/server"
import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns"
import { useParams } from "next/navigation"

const CompanyPage = async () => {
  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })

  const { slug: rawSlug } = useParams<{ slug: string }>()
  const slug = decodeURIComponent(rawSlug)

  const trpc = useTRPC()

  const company = await server.company.getBySlug.query(slug)

  const { data: futureEvents } = trpc.event.all.queryOptions({ filter: { byOrganizingCompany: [company.id], byEndDate: { max: now, min: null } } })

  const { events: pastEvents, fetchNextPage } = useEventAllInfiniteQuery({
      filter: {
        byOrganizingCompany: [company.id],
        byEndDate: {
          max: now,
          min: null,
        },
      },
    })

  return <CompanyView company={company} futureEvents={futureEvents} pastEvents={pastEvents} fetchNextPage={fetchNextPage} />
}

export default CompanyPage
