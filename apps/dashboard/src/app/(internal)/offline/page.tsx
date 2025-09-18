"use client"

import { GenericTable } from "@/components/GenericTable"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
import { useCreateOfflineModal } from "./modals/create-offline-modal"
import { useOfflineAllQuery } from "./queries/use-offlines-all-query"
import { useOfflineTable } from "./use-offline-table"

export default function OfflinePage() {
  const { offlines, isLoading: isOfflinesLoading } = useOfflineAllQuery()
  const open = useCreateOfflineModal()
  const table = useOfflineTable({ data: offlines })

  return (
    <Skeleton visible={isOfflinesLoading}>
      <Stack>
        <Box>
          <Button onClick={open}>Legg inn ny Offline</Button>
        </Box>
        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}
