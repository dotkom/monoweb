"use client"

import { Skeleton, Stack, Title } from "@mantine/core"
import { DeregisterReasonsTable } from "./deregister-reasons-table"
import { useDeregisterReasonWithEventAllInfiniteQuery } from "./queries"

export default function DeregisterReasonPage() {
  const { deregisterReasons, isLoading, fetchNextPage } = useDeregisterReasonWithEventAllInfiniteQuery()

  return (
    <Stack>
      <Title>Avmeldingsgrunner</Title>
      <Skeleton visible={isLoading}>
        <DeregisterReasonsTable data={deregisterReasons} onLoadMore={fetchNextPage} />
      </Skeleton>
    </Stack>
  )
}
