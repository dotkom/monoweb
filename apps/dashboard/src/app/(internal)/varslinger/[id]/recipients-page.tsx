"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { GenericTable } from "@/components/GenericTable"
import { RecipientPickerInput } from "@/components/forms/RecipientPickerInput"
import { Box, Button, Group, Skeleton, Stack, Text, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { type FC, useMemo, useState } from "react"
import { useNotificationRecipientsQuery } from "../queries"
import { useAddNotificationRecipientsMutation } from "../mutations"
import { useNotificationDetailsContext } from "./provider"
import { IconMail, IconMailOpened } from "@tabler/icons-react"

type Recipient = {
  id: string
  userId: string
  user: { id: string; name: string | null }
}

export const NotificationRecipientsPage: FC = () => {
  const { notification } = useNotificationDetailsContext()
  const { recipients, readCount, unreadCount, isLoading } = useNotificationRecipientsQuery(notification.id)
  const addRecipients = useAddNotificationRecipientsMutation(notification.id)
  const [recipientIds, setRecipientIds] = useState<string[]>([])
  const { canManageNotifications } = useAuthorization()
  const canManage = canManageNotifications()

  const columnHelper = createColumnHelper<Recipient>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((recipient) => recipient.user.name ?? recipient.userId, {
        id: "name",
        header: () => "Navn",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: recipients,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const totalRecipients = readCount + unreadCount
  const readPercentage = (readCount / totalRecipients) * 100

  return (
    <Stack gap="lg">
      <Box>
        <Title order={3} mb="sm">
          Legg til mottakere
        </Title>
        <RecipientPickerInput value={recipientIds} onChange={setRecipientIds} disabled={!canManage} />
        <PermissionTooltip allowed={canManage} label="Du har ikke tilgang til å legge til mottakere">
          <Button
            mt="md"
            disabled={!canManage || recipientIds.length === 0 || addRecipients.isPending}
            onClick={() => {
              addRecipients.mutate(
                { notificationId: notification.id, recipientIds },
                { onSuccess: () => setRecipientIds([]) }
              )
            }}
          >
            Legg til {recipientIds.length > 0 ? `${recipientIds.length} mottaker(e)` : "mottakere"}
          </Button>
        </PermissionTooltip>
      </Box>

      <Title order={3}>Nåværende mottakere ({recipients.length})</Title>

      {!isLoading && totalRecipients > 0 && (
        <Stack gap="xs">
          <Group gap="xs">
            <IconMailOpened size={18} color="var(--mantine-color-dimmed)" />

            <Text size="sm" c="dimmed">
              <Text component="span" c="var(--mantine-color-text)" fw="bold">
                {readCount}
              </Text>{" "}
              lest ({readPercentage.toFixed(0)}%)
            </Text>
          </Group>
          <Group gap="xs">
            <IconMail size={18} color="var(--mantine-color-dimmed)" />

            <Text size="sm" c="dimmed">
              <Text component="span" c="var(--mantine-color-text)" fw="bold">
                {unreadCount}
              </Text>{" "}
              ulest
            </Text>
          </Group>
        </Stack>
      )}

      <Skeleton visible={isLoading}>
        <GenericTable table={table} />
      </Skeleton>
    </Stack>
  )
}
