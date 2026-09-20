"use client"

import { GenericTable } from "@/components/GenericTable"
import { TableCellLink } from "@/components/TableCellLink"
import type { NotificationRecipientListItem } from "@dotkomonline/rpc/notification"
import { Avatar, Button, Checkbox, Group, Stack, Text, TextInput } from "@mantine/core"
import { modals } from "@mantine/modals"
import { createColumnHelper, getCoreRowModel, useReactTable, type RowSelectionState } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useRemoveNotificationRecipientsMutation } from "../mutations"

interface NotificationRecipientsTableProps {
  notificationId: string
  recipients: NotificationRecipientListItem[]
  canManage: boolean
  onLoadMore: () => void
}

function matchesNameFilter(recipient: NotificationRecipientListItem, search: string): boolean {
  const trimmedSearch = search.trim().toLowerCase()

  if (trimmedSearch.length === 0) {
    return true
  }

  const name = recipient.user.name ?? ""

  return name.toLowerCase().includes(trimmedSearch)
}

function formatRemoveConfirmText(selectedCount: number): string {
  if (selectedCount === 1) {
    return "Er du sikker på at du vil fjerne 1 mottaker? Personen vil ikke lenger se varslingen."
  }

  return `Er du sikker på at du vil fjerne ${selectedCount} mottakere? De vil ikke lenger se varslingen.`
}

export function NotificationRecipientsTable({
  notificationId,
  recipients,
  canManage,
  onLoadMore,
}: NotificationRecipientsTableProps) {
  const removeRecipients = useRemoveNotificationRecipientsMutation()
  const [nameFilter, setNameFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filteredRecipients = useMemo(() => {
    return recipients.filter((recipient) => matchesNameFilter(recipient, nameFilter))
  }, [nameFilter, recipients])

  const columnHelper = createColumnHelper<NotificationRecipientListItem>()
  const selectColumn = columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Velg alle"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox aria-label="Velg mottaker" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
    ),
  })
  const userColumn = columnHelper.accessor((recipient) => recipient.user, {
    id: "user",
    header: () => "Mottaker",
    cell: (info) => {
      const user = info.getValue()

      return (
        <TableCellLink href={`/brukere/${user.id}`}>
          <Group gap="sm" wrap="nowrap">
            <Avatar src={user.imageUrl ?? undefined} size="sm" radius="xl">
              {user.name?.charAt(0)}
            </Avatar>
            <Text size="sm">{user.name ?? "Ukjent"}</Text>
          </Group>
        </TableCellLink>
      )
    },
  })
  const selectColumns = canManage ? [selectColumn] : []
  const columns = [...selectColumns, userColumn]

  const table = useReactTable({
    data: filteredRecipients,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: canManage,
    onRowSelectionChange: setRowSelection,
    getRowId: (recipient) => recipient.userId,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedUserIds = Object.keys(rowSelection).filter((userId) => rowSelection[userId])
  const selectedCount = selectedUserIds.length

  const openRemoveSelectedModal = () => {
    modals.openConfirmModal({
      title: "Fjern mottakere",
      children: <Text size="sm">{formatRemoveConfirmText(selectedCount)}</Text>,
      labels: { confirm: "Fjern", cancel: "Avbryt" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        removeRecipients.mutate(
          {
            notificationId,
            userIds: selectedUserIds,
          },
          {
            onSuccess: () => {
              setRowSelection({})
            },
          }
        )
      },
    })
  }

  return (
    <Stack>
      <Group justify="space-between" wrap="wrap">
        <TextInput
          placeholder="Søk etter navn"
          value={nameFilter}
          onChange={(event) => setNameFilter(event.currentTarget.value)}
        />

        {canManage && (
          <Button
            color="red"
            variant="light"
            disabled={selectedCount === 0}
            loading={removeRecipients.isPending}
            onClick={openRemoveSelectedModal}
          >
            Fjern valgte
          </Button>
        )}
      </Group>

      <GenericTable table={table} onLoadMore={onLoadMore} />
    </Stack>
  )
}
