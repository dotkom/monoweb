import { useTRPC } from "@/lib/trpc"
import type { Company, CompanyId, Event } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"

export const useCompanyAllQuery = () => {
  const trpc = useTRPC()
  const { data: companies, ...query } = useQuery({ ...trpc.company.all.queryOptions({ take: 999 }), initialData: [] })
  return { companies: companies as Company[], ...query }
}

export const useCompanyEventsAllQuery = (id: CompanyId) => {
  const trpc = useTRPC()
  const { data: companyEvents, ...query } = useQuery({
    ...trpc.company.event.get.queryOptions({
      id,
    }),
    initialData: [],
  })

  return { companyEvents: companyEvents as Event[], ...query }
}

export const useCompanyByIdQuery = (id: CompanyId) => {
  const trpc = useTRPC()
  return useQuery(trpc.company.getById.queryOptions(id))
}
