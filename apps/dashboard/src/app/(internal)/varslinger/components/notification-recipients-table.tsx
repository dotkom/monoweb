"use client"

import { DataTable } from "@/components/DataTable"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import type { NotificationRecipientListItem } from "@dotkomonline/rpc/notification"
import { Avatar, AvatarFallback, AvatarImage, Button, Checkbox, Text, TextInput, TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable, type RowSelectionState } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useRemoveNotificationRecipientsMutation } from "../mutations"

interface NotificationRecipientsTableProps {
  notificationId: string
  recipients: NotificationRecipientListItem[]
  canManage: boolean
  onLoadMore?: () => void
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
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)

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
        onCheckedChange={(checked) => {
          table.toggleAllRowsSelected(checked === true)
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Velg mottaker"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => {
          row.toggleSelected(checked === true)
        }}
      />
    ),
  })
  const userColumn = columnHelper.accessor((recipient) => recipient.user, {
    id: "user",
    header: () => "Mottaker",
    cell: (info) => {
      const user = info.getValue()

      return (
        <TextLink href={`/brukere/${user.id}`} className="text-sm">
          <span className="flex items-center gap-2">
            <Avatar size="sm">
              {user.imageUrl && <AvatarImage src={user.imageUrl} alt="" />}
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Text className="text-sm">{user.name ?? "Ukjent"}</Text>
          </span>
        </TextLink>
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput
          placeholder="Søk etter navn"
          value={nameFilter}
          onChange={(event) => setNameFilter(event.currentTarget.value)}
        />

        {canManage && (
          <Button
            color="red"
            variant="secondary"
            disabled={selectedCount === 0 || removeRecipients.isPending}
            onClick={() => setIsRemoveOpen(true)}
          >
            Fjern valgte
          </Button>
        )}
      </div>

      <DataTable table={table} fetchNextPage={onLoadMore} hasNextPage={onLoadMore !== undefined} />

      <ConfirmDeleteModal
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        title="Fjern mottakere"
        description={formatRemoveConfirmText(selectedCount)}
        confirmLabel="Fjern"
        cancelLabel="Avbryt"
        onConfirm={() => {
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
        }}
      />
    </div>
  )
}
