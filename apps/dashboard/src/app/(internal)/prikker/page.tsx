"use client"

import { Button, Group, Skeleton, Stack } from "@mantine/core"
import { useCreateMarkModal } from "./modals/create-mark-modal"
import { useCreateSuspensionModal } from "./modals/create-suspension-modal"
import { PunishmentTable } from "./punishment-table"
import { usePunishmentAllInfiniteQuery } from "./queries/use-punishment-all-query"

export default function MarkPage() {
  const { marks, isLoading: isMarksLoading, fetchNextPage, isFetchingNextPage } = usePunishmentAllInfiniteQuery()

  const openCreateMarkModal = useCreateMarkModal()
  const openCreateSuspensionModal = useCreateSuspensionModal()

  return (
    <Stack>
      <Group>
        <Button onClick={openCreateMarkModal}>Gi ny prikk</Button>
        <Button onClick={openCreateSuspensionModal}>Gi ny suspensjon</Button>
      </Group>
      <Skeleton visible={isMarksLoading}>
        <PunishmentTable
          marks={marks}
          onLoadMore={fetchNextPage}
          isLoading={isMarksLoading}
          isLoadingMore={isFetchingNextPage}
        />
      </Skeleton>
    </Stack>
  )
}
