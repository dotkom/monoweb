import { useTRPC } from "@/lib/trpc"
import type { AttendanceId, UserFilterQuery } from "@dotkomonline/types"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

export const useUserQuery = (id: AttendanceId) => {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(trpc.user.get.queryOptions(id))
  return { data, isLoading }
}

interface UseUserAllQueryProps {
  filter?: UserFilterQuery
  page?: Pageable
}

export const useUserAllQuery = ({ filter, page }: UseUserAllQueryProps) => {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(
    trpc.user.all.queryOptions({
      filter,
      ...page,
    })
  )
  return { users: useMemo(() => data?.items ?? [], [data]), isLoading }
}

export const useUserAllInfiniteQuery = ({ filter, page }: UseUserAllQueryProps) => {
  const trpc = useTRPC()
  const { data: users, ...query } = useInfiniteQuery({
    ...trpc.user.all.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (res) => res.pages.flatMap((p) => p.items),
  })

  return { users, ...query }
}
