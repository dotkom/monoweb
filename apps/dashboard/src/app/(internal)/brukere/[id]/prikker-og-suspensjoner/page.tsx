"use client"

import { MarkTable } from "@/app/(internal)/prikker/MarkTable"
import { useMarkFindManyInfiniteQuery } from "@/app/(internal)/prikker/queries"
import { Title } from "@dotkomonline/ui"
import { useUserDetailsContext } from "../provider"

export default function UserPrikkerPage() {
  const { user } = useUserDetailsContext()

  const { marks, fetchNextPage, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage } =
    useMarkFindManyInfiniteQuery({
      filter: {
        byGivenToUserId: [user.id],
      },
    })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" className="text-2xl font-semibold">
        Prikker
      </Title>
      <MarkTable
        marks={marks}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage ?? false}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}
