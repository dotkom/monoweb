import { CompanyView } from "@/components/views/CompanyView"
import { server } from "@/utils/trpc/server"

const CompanyPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const company = await server.company.getBySlug.query(slug)
  const events = await server.event.allByCompany.query({ id: company.id })
  return <CompanyView company={company} events={events} />
}

export default CompanyPage
