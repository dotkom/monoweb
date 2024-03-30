import { CompanyView } from "@/components/views/CompanyView"
import { getServerClient } from "@/utils/trpc/serverClient"

const CompanyPage = async ({ params: { id } }: { params: { id: string } }) => {
  const serverClient = await getServerClient()
  const eventsData = await serverClient.event.allByCompany({ id })
  const company = await serverClient.company.get(id)

  return <CompanyView company={company} events={eventsData} isLoadingEvents={false} />
}

export default CompanyPage
