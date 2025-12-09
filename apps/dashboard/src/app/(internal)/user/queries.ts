import type { Pageable } from "@dotkomonline/rpc"
import type { AttendanceId, UserFilterQuery, UserId } from "@dotkomonline/types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTRPC } from "@/lib/trpc-client"

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

export const useIsAdminQuery = () => {
  const trpc = useTRPC()
  const { data: isAdmin, isLoading } = useQuery(trpc.user.isAdmin.queryOptions())
  return { isAdmin, isLoading }
}

export const useFindWorkspaceUserQuery = (userId: UserId, customKey?: string, enabled = true) => {
  const trpc = useTRPC()
  const {
    data: workspaceUser,
    isLoading,
    error,
  } = useQuery(trpc.workspace.findUser.queryOptions({ userId, customKey }, { enabled }))
  return { workspaceUser, isLoading, error }
}
