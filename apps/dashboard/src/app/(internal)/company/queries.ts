import type { Company, CompanyId, CompanySlug } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTRPC } from "@/lib/trpc-client"

export const useCompanyAllQuery = () => {
  const trpc = useTRPC()
  const { data: companies, ...query } = useQuery({ ...trpc.company.all.queryOptions({ take: 999 }), initialData: [] })
  return { companies: companies as Company[], ...query }
}

export const useCompanyEventsAllQuery = (id: CompanyId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.event.all.queryOptions({
      filter: {
        byOrganizingCompany: [id],
        excludingType: [],
      },
    }),
  })

  const events = useMemo(() => data?.items ?? [], [data])

  return { events, ...query }
}

export const useCompanyBySlugQuery = (slug: CompanySlug) => {
  const trpc = useTRPC()
  return useQuery(trpc.company.getBySlug.queryOptions(slug))
}
