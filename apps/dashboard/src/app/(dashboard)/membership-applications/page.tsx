"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Card, Group, Skeleton, Stack } from "@mantine/core"
import { GenericTable } from "../../../components/GenericTable"
import { useCreateOfflineModal } from "../../../modules/offline/modals/create-offline-modal"
import { useOfflineTable } from "../../../modules/offline/use-offline-table"
import { trpc } from "src/utils/trpc"
import { useMembershipApplicationTable } from "./use-membership-application-table"

export default function OfflinePage() {
  const { data, isLoading } = trpc.membershipApplication.all.useQuery({ take: 999 })

  const open = useCreateOfflineModal()
  const table = useMembershipApplicationTable({ data: data ?? [] })

  return (
    <Skeleton visible={isLoading}>
      <Stack>
        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}
