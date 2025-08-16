import { useEventAllInfiniteQuery, useEventAllQuery } from "@/app/arrangementer/components/queries"
import { CompanyView } from "@/components/views/CompanyView"
import { server } from "@/utils/trpc/server"
import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns"

interface CompanyPageProps {
  params: Promise<{ slug: string }>
}

const CompanyPage = async ({ params }: CompanyPageProps) => {
  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })

  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)

  const company = await server.company.getBySlug.query(slug)

  const { eventDetails: futureEventWithAttendances } = useEventAllQuery({
    filter: { byOrganizingCompany: [company.id], byStartDate: { min: now, max: null } },
  })

  const { eventDetails: pastEventWithAttendances, fetchNextPage } = useEventAllInfiniteQuery({
    filter: {
      byOrganizingCompany: [company.id],
      byEndDate: {
        max: now,
        min: null,
      },
    },
  })

  return (
    <CompanyView
      company={company}
      futureEventWithAttendances={futureEventWithAttendances}
      pastEventWithAttendances={pastEventWithAttendances}
      onLoadMore={fetchNextPage}
    />
  )
}

export default CompanyPage
