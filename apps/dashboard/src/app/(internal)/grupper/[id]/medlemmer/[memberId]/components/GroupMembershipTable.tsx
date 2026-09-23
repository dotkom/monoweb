"use client"

import { DataTable } from "@/components/DataTable"
import { DateTooltip } from "@/components/DateTooltip"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import type { GroupMember, GroupMembership } from "@dotkomonline/rpc/group"
import { Button, Text } from "@dotkomonline/ui"
import { ogJoin } from "@dotkomonline/utils"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { useDeleteGroupMembershipMutation } from "@/app/(internal)/grupper/mutations"
import { EditGroupMembershipModal } from "./EditGroupMembershipModal"

interface Props {
  groupMember: GroupMember
  disabled?: boolean
}

type DeleteModalState = {
  membership: GroupMembership
}

export const GroupMembershipTable = ({ groupMember, disabled }: Props) => {
  const [editMembership, setEditMembership] = useState<GroupMembership | null>(null)
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null)
  const deleteGroupMembership = useDeleteGroupMembershipMutation(groupMember.id)
  const router = useRouter()
  const hasOnlyOneMembership = groupMember.groupMemberships.length === 1

  const openDeleteGroupMembershipModal = useCallback((groupMembership: GroupMembership) => {
    setDeleteModal({ membership: groupMembership })
  }, [])

  const columnHelper = createColumnHelper<GroupMembership>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((membership) => membership, {
        id: "roles",
        header: () => "Roller",
        cell: (info) =>
          info
            .getValue()
            .roles.map((role) => role.name)
            .join(", "),
      }),
      columnHelper.accessor((membership) => membership, {
        id: "start",
        header: () => "Startdato",
        cell: (info) => <DateTooltip date={info.getValue().start} />,
      }),
      columnHelper.accessor((membership) => membership, {
        id: "end",
        header: () => "Sluttdato",
        cell: (info) => {
          const end = info.getValue().end
          return end ? <DateTooltip date={end} /> : "-"
        },
      }),
      columnHelper.accessor((membership) => membership, {
        id: "edit",
        header: () => "Rediger",
        cell: (info) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditMembership(info.getValue())}
            disabled={disabled}
          >
            Rediger
          </Button>
        ),
      }),
      columnHelper.accessor((membership) => membership, {
        id: "delete",
        header: () => "Slett",
        cell: (info) => (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => openDeleteGroupMembershipModal(info.getValue())}
            disabled={disabled}
          >
            Slett
          </Button>
        ),
      }),
    ],
    [columnHelper, openDeleteGroupMembershipModal, disabled]
  )

  const table = useReactTable({
    data: groupMember.groupMemberships,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const deleteText =
    deleteModal !== null
      ? getDeleteGroupMembershipConfirmText(deleteModal.membership, groupMember, hasOnlyOneMembership)
      : ""

  return (
    <>
      <DataTable table={table} />

      <EditGroupMembershipModal
        open={editMembership !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditMembership(null)
          }
        }}
        groupMembership={editMembership}
      />

      <ConfirmDeleteModal
        open={deleteModal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModal(null)
          }
        }}
        title="Slett gruppemedlemskap"
        cancelLabel="Avbryt"
        confirmLabel="Slett"
        description={
          <div className="flex flex-col gap-3">
            <Text className="text-sm">
              Slett bare hvis dette medlemskapet ikke skulle eksistert. Historikken fjernes permanent. Skal personen
              bare slutte eller bytte roller? Bruk "Avslutt medlemskap" eller "Avslutt nåværende og lag nytt medlemskap"
              i stedet.
            </Text>
            <Text className="font-semibold text-destructive">{deleteText}</Text>
          </div>
        }
        onConfirm={() => {
          if (!deleteModal) {
            return
          }

          deleteGroupMembership.mutate(
            {
              id: deleteModal.membership.id,
              groupId: deleteModal.membership.groupId,
            },
            {
              onSuccess: () => {
                if (hasOnlyOneMembership) {
                  router.back()
                }
              },
            }
          )
          setDeleteModal(null)
        }}
      />
    </>
  )
}

function getDeleteGroupMembershipConfirmText(
  groupMembership: GroupMembership,
  groupMember: GroupMember,
  deleteRemovesUserFromGroup: boolean
) {
  const roles = ogJoin(groupMembership.roles.map((role) => role.name))
  const period = `${formatDate(groupMembership.start, "dd.MM.yyyy")} - ${groupMembership.end ? formatDate(groupMembership.end, "dd.MM.yyyy") : "Nå"}`

  const removalWarningText = deleteRemovesUserFromGroup
    ? ` Dette er brukerens siste gruppemedlemskap, så ${groupMember.name} fjernes også fra gruppen.`
    : ""

  return `Er du sikker på at du vil slette gruppemedlemskapet ${roles} ${period}?${removalWarningText}`
}
