import { CompanyView } from "@/components/views/CompanyView"
import { server } from "@/utils/trpc/server"

const CompanyPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const company = await server.company.getBySlug.query(slug)
  const attendanceEvents = await server.event.all.query({
    filter: {
      byOrganizingCompany: [company.id],
    },
  })
  return <CompanyView company={company} events={attendanceEvents.items} />
}

export default CompanyPage
