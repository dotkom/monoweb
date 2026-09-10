"use client"
import { DateTooltip } from "@/components/DateTooltip"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import type { GroupMember, GroupMembership } from "@dotkomonline/rpc/group"
import { ogJoin } from "@dotkomonline/utils"
import { Button } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"
import { useEditGroupMembershipModal } from "../../modals/edit-group-membership-modal"
import { useDeleteGroupMembershipMutation } from "../../mutations"

interface Props {
  groupMember: GroupMember
}

export const useGroupMembershipTable = ({ groupMember }: Props) => {
  const columnHelper = createColumnHelper<GroupMembership>()
  const openGroupEditModal = useEditGroupMembershipModal()
  const deleteGroupMembership = useDeleteGroupMembershipMutation(groupMember.id)
  const router = useRouter()

  const hasOnlyOneMembership = groupMember.groupMemberships.length === 1

  const openDeleteGroupMembershipModal = useCallback(
    (groupMembership: GroupMembership) => {
      return ConfirmDeleteModal({
        title: "Slett gruppemedlemskap",
        text: getDeleteGroupMembershipConfirmText(groupMembership, groupMember, hasOnlyOneMembership),
        additionalInfoText:
          'Slett bare hvis dette medlemskapet ikke skulle eksistert. Historikken fjernes permanent. Skal personen bare slutte eller bytte roller? Bruk "Avslutt medlemskap" eller "Avslutt nåværende og lag nytt medlemskap" i stedet.',
        onConfirm: () => {
          deleteGroupMembership.mutate(
            {
              id: groupMembership.id,
              groupId: groupMembership.groupId,
            },
            {
              onSuccess: () => {
                if (hasOnlyOneMembership) {
                  router.back()
                }
              },
            }
          )
        },
        confirmText: "Slett",
        cancelText: "Avbryt",
      })
    },
    [deleteGroupMembership, groupMember, hasOnlyOneMembership, router]
  )

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
          <Button size="sm" variant="subtle" onClick={() => openGroupEditModal({ groupMembership: info.getValue() })}>
            Rediger
          </Button>
        ),
      }),
      columnHelper.accessor((membership) => membership, {
        id: "delete",
        header: () => "Slett",
        cell: (info) => (
          <Button
            size="sm"
            variant="subtle"
            color="red"
            onClick={() => openDeleteGroupMembershipModal(info.getValue())}
          >
            Slett
          </Button>
        ),
      }),
    ],
    [columnHelper, openGroupEditModal, openDeleteGroupMembershipModal]
  )

  return useReactTable({
    data: groupMember.groupMemberships,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
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
