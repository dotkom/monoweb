"use client"

import { Title } from "@dotkomonline/ui"
import { DeregisterReasonTable } from "./DeregisterReasonTable"
import { useDeregisterReasonWithEventAllInfiniteQuery } from "./queries"

export default function DeregisterReasonPage() {
  const { deregisterReasons, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useDeregisterReasonWithEventAllInfiniteQuery()

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Avmeldingsgrunner
      </Title>

      <DeregisterReasonTable
        deregisterReasons={deregisterReasons}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}
