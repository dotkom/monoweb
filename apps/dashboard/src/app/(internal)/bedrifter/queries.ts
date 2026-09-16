import { useTRPC } from "@/lib/trpc-client"
import type { CompanyFilterQuery, CompanyId, CompanySlug } from "@dotkomonline/rpc/company"
import type { Pageable } from "@dotkomonline/utils"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface UseCompanyAllInfiniteQueryProps {
  filter: CompanyFilterQuery
  page: Pageable
}

export const useCompanyAllInfiniteQuery = ({ filter, page }: UseCompanyAllInfiniteQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.company.findMany.infiniteQueryOptions({ filter, ...page }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const companies = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return { companies, ...query }
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
