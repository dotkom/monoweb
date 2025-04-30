"use client"

import { GenericTable } from "@/components/GenericTable"
import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Card, Group, Skeleton, Stack } from "@mantine/core"
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
        <Card withBorder>
          <GenericTable table={table} />
        </Card>
        <Group justify="space-between">
          <Button onClick={open}>Legg inn ny Offline</Button>
          <ButtonGroup>
            <Button variant="subtle">
              <Icon icon="tabler:caret-left" />
            </Button>
            <Button variant="subtle">
              <Icon icon="tabler:caret-right" />
            </Button>
          </ButtonGroup>
        </Group>
      </Stack>
    </Skeleton>
  )
}
