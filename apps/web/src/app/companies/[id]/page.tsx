import { CompanyView } from "@/components/views/CompanyView"
import { server } from "@/utils/trpc/server"

const CompanyPage = async ({ params: { id } }: { params: { id: string } }) => {
  const eventsData = await server.event.allByCompany.query({ id })
  const company = await server.company.get.query(id)

  return <CompanyView company={company} events={eventsData} />
}

export default CompanyPage
