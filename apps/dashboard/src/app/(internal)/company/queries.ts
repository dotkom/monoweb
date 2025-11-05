import { useTRPC } from "@/lib/trpc-client"
import type { CompanyId, CompanySlug } from "@dotkomonline/types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

export const useCompanyAllQuery = () => {
  const trpc = useTRPC()
  const { data, isLoading } = useInfiniteQuery({
    ...trpc.company.findMany.infiniteQueryOptions({}),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const companies = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return { companies, isLoading }
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
