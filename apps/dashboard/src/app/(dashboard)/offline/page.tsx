"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Card, Group, Skeleton, Stack } from "@mantine/core"
import { GenericTable } from "../../../components/GenericTable"
import { useOfflineAllQuery } from "../../../modules/offline/queries/use-offlines-all-query"
import { useCreateOfflineModal } from "../../../modules/offline/modals/create-offline-modal"
import { useOfflineTable } from "../../../modules/offline/use-offline-table"

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
