import { useTRPC } from "@/lib/trpc-client"
import type { AttendanceId, MarkFilterQuery, UserFilterQuery, UserId } from "@dotkomonline/types"

import type { Pageable } from "@dotkomonline/rpc"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
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

  return { users: useMemo(() => users ?? [], [users]), ...query }
}

export const useGroupAllByMemberQuery = (userId: UserId) => {
  const trpc = useTRPC()
  const { data: groups } = useQuery({
    ...trpc.group.allByMember.queryOptions(userId),
    initialData: [],
  })

  return groups
}

export const useMarkAllQuery = (filter: MarkFilterQuery) => {
  const trpc = useTRPC()
  const { data: marks } = useQuery({ ...trpc.mark.findMany.queryOptions(filter), initialData: [] })
  return marks
}
