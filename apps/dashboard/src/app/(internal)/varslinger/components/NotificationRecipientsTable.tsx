"use client"

import { DataTable } from "@/components/DataTable"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import type { NotificationRecipientFilterQuery, NotificationRecipientListItem } from "@dotkomonline/rpc/notification"
import { Avatar, AvatarFallback, AvatarImage, Button, Checkbox, Text, TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable, type RowSelectionState } from "@tanstack/react-table"
import { useState } from "react"
import { useRemoveNotificationRecipientsMutation } from "../mutations"
import { NotificationRecipientFilters } from "./NotificationRecipientFilters"

interface NotificationRecipientsTableProps {
  notificationId: string
  recipients: NotificationRecipientListItem[]
  recipientFilters: NotificationRecipientFilterQuery
  setRecipientFilters: (filters: NotificationRecipientFilterQuery) => void
  canManage: boolean
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
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
  recipientFilters,
  setRecipientFilters,
  canManage,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  isLoading,
  isPlaceholderData,
}: NotificationRecipientsTableProps) {
  const removeRecipients = useRemoveNotificationRecipientsMutation()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)

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
    data: recipients,
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <NotificationRecipientFilters onChange={setRecipientFilters} defaultValues={recipientFilters} />
        {canManage && (
          <Button
            size="lg"
            variant="destructive"
            disabled={selectedCount === 0 || removeRecipients.isPending}
            onClick={() => setIsRemoveOpen(true)}
          >
            Fjern valgte
          </Button>
        )}
      </div>

      <DataTable
        table={table}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        isFetchingNextPage={isFetchingNextPage}
      />

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
