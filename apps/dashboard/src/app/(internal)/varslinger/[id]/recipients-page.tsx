"use client"

import { GenericTable } from "@/components/GenericTable"
import { DateTooltip } from "@/components/DateTooltip"
import { RecipientPickerInput } from "@/components/forms/RecipientPickerInput"
import { Box, Button, Skeleton, Stack, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { type FC, useMemo, useState } from "react"
import { useNotificationRecipientsQuery } from "../queries"
import { useAddNotificationRecipientsMutation } from "../mutations"
import { useNotificationDetailsContext } from "./provider"

type Recipient = {
  id: string
  readAt: Date | null
  userId: string
  user: { id: string; name: string | null }
}

export const NotificationRecipientsPage: FC = () => {
  const { notification } = useNotificationDetailsContext()
  const { recipients, isLoading } = useNotificationRecipientsQuery(notification.id)
  const addRecipients = useAddNotificationRecipientsMutation(notification.id)
  const [recipientIds, setRecipientIds] = useState<string[]>([])

  const columnHelper = createColumnHelper<Recipient>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((r) => r.user.name ?? r.userId, {
        id: "name",
        header: () => "Navn",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor((r) => r.readAt, {
        id: "readAt",
        header: () => "Lest",
        cell: (info) => {
          const value = info.getValue()
          return value ? <DateTooltip date={value} /> : "Ulest"
        },
        sortingFn: "datetime",
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: recipients,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Stack gap="lg">
      <Box>
        <Title order={3} mb="sm">
          Legg til mottakere
        </Title>
        <RecipientPickerInput value={recipientIds} onChange={setRecipientIds} />
        <Button
          mt="md"
          disabled={recipientIds.length === 0 || addRecipients.isPending}
          onClick={() => {
            addRecipients.mutate(
              { notificationId: notification.id, recipientIds },
              { onSuccess: () => setRecipientIds([]) }
            )
          }}
        >
          Legg til {recipientIds.length > 0 ? `${recipientIds.length} mottaker(e)` : "mottakere"}
        </Button>
      </Box>

      <Box>
        <Title order={3} mb="sm">
          Nåværende mottakere ({recipients.length})
        </Title>
        <Skeleton visible={isLoading}>
          <GenericTable table={table} />
        </Skeleton>
      </Box>
    </Stack>
  )
}
