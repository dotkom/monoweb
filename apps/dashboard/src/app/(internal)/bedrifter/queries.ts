import { useTRPC } from "@/lib/trpc-client"
import type { CompanyFilterQuery, CompanyId, CompanySlug } from "@dotkomonline/rpc/company"
import type { Pageable } from "@dotkomonline/utils"
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface UseCompanyAllInfiniteQueryProps {
  filter: CompanyFilterQuery
  page?: Pageable
}

export const useCompanyAllInfiniteQuery = ({
  filter,
  page,
  shouldKeepPreviousData,
}: UseCompanyAllInfiniteQueryProps & { shouldKeepPreviousData?: boolean }) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.company.findMany.infiniteQueryOptions({ filter, ...page }),
    select: (data) => data.pages.flatMap((page) => page.items),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: shouldKeepPreviousData ? keepPreviousData : undefined,
  })

  const companies = useMemo(() => data ?? [], [data])

  return { companies, ...query }
}

export const useCompanyEventsAllInfiniteQuery = (id: CompanyId) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.all.infiniteQueryOptions({
      filter: {
        byOrganizingCompany: [id],
        excludingType: [],
      },
    }),
    select: (data) => data.pages.flatMap((page) => page.items),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const events = useMemo(() => data ?? [], [data])

  return { events, ...query }
}

export const useCompanyByIdQuery = (id: CompanyId, enabled?: boolean) => {
  const trpc = useTRPC()
  return useQuery(trpc.company.getById.queryOptions(id, { enabled }))
}

export const useCompanyBySlugQuery = (slug: CompanySlug) => {
  const trpc = useTRPC()
  return useQuery(trpc.company.getBySlug.queryOptions(slug))
}
