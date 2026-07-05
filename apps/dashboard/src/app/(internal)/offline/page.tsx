"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { GenericTable } from "@/components/GenericTable"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
import { useCreateOfflineModal } from "./modals/create-offline-modal"
import { useOfflineAllQuery } from "./queries/use-offlines-all-query"
import { useOfflineTable } from "./use-offline-table"

export default function OfflinePage() {
  const { offlines, isLoading: isOfflinesLoading } = useOfflineAllQuery()
  const { canEditOffline } = useAuthorization()
  const canEdit = canEditOffline()
  const open = useCreateOfflineModal()
  const table = useOfflineTable({ data: offlines })

  return (
    <Skeleton visible={isOfflinesLoading}>
      <Stack>
        <Box>
          <PermissionTooltip allowed={canEdit}>
            <Button onClick={open} disabled={!canEdit}>
              Legg inn ny Offline
            </Button>
          </PermissionTooltip>
        </Box>
        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}
