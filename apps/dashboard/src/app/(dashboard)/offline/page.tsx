"use client"

import { Icon } from "@iconify/react"
import { Box, Button, ButtonGroup, Skeleton, Stack } from "@mantine/core"
import { GenericTable } from "../../../components/GenericTable"
import { useCreateOfflineModal } from "../../../modules/offline/modals/create-offline-modal"
import { useOfflineAllQuery } from "../../../modules/offline/queries/use-offlines-all-query"
import { useOfflineTable } from "../../../modules/offline/use-offline-table"

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
        <ButtonGroup ml="auto">
          <Button variant="subtle">
            <Icon icon="tabler:caret-left" />
          </Button>
          <Button variant="subtle">
            <Icon icon="tabler:caret-right" />
          </Button>
        </ButtonGroup>
      </Stack>
    </Skeleton>
  )
}
