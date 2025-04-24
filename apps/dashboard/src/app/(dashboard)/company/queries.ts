import type { Company, CompanyId, Event } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "../../../trpc"

export const useCompanyAllQuery = () => {
  const trpc = useTRPC()
  const { data: companies, ...query } = useQuery(trpc.company.all.queryOptions({ take: 999 }, { initialData: [] }))
  return { companies: companies as Company[], ...query }
}

export const useCompanyEventsAllQuery = (id: CompanyId) => {
  const trpc = useTRPC()
  const { data: companyEvents, ...query } = useQuery(
    trpc.company.event.get.queryOptions(
      {
        id,
      },
      { initialData: [] as Event[] }
    )
  )

  return { companyEvents: companyEvents as Event[], ...query }
}
