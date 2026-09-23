import { useTRPC } from "@/lib/trpc-client"
import type { MarkFilterQuery, MarkId } from "@dotkomonline/rpc/mark"
import type { Pageable } from "@dotkomonline/utils"
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface UseMarkFindManyProps {
  filter?: MarkFilterQuery
  page?: Pageable
}

export const useMarkFindManyInfiniteQuery = ({ filter, page }: UseMarkFindManyProps = {}) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.mark.findMany.infiniteQueryOptions({
      ...page,
      filter,
    }),
    select: (data) => data.pages.flatMap((page) => page.items),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  })

  const marks = useMemo(() => data ?? [], [data])

  return { marks, ...query }
}

export const useMarkGetQuery = (id: MarkId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.mark.get.queryOptions(id))

  const mark = data ?? null

  return { mark, ...query }
}

export const usePersonalMarkDetailsByMarkQuery = (markId: MarkId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(
    trpc.personalMark.getPersonalMarkDetailsByMark.queryOptions({
      markId,
    })
  )

  const personalMarks = useMemo(() => data ?? [], [data])

  return { personalMarks, ...query }
}

export const useMarkCountUsersQuery = (markId: MarkId) => {
  const trpc = useTRPC()
  return useQuery(trpc.personalMark.countUsersWithMark.queryOptions({ markId }))
}

export const usePersonalMarkGetByMarkId = (markId: MarkId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.personalMark.getByMark.queryOptions({
      markId,
    }),
  })

  const personalMarks = useMemo(() => data ?? [], [data])

  return { personalMarks, ...query }
}
