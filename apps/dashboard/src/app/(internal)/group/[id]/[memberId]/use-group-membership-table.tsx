"use client"

import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import type { GroupMember, GroupMembership } from "@dotkomonline/types"
import { Button } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { useMemo } from "react"
import { useEditGroupMembershipModal } from "../../modals/edit-group-membership-modal"
import { useEndGroupMembershipMutation } from "../../mutations"
import { useGroupDetailsContext } from "../provider"

interface Props {
  groupMember: GroupMember
}

export const useGroupMembershipTable = ({ groupMember }: Props) => {
  const columnHelper = createColumnHelper<GroupMembership>()
  const openGroupEditModal = useEditGroupMembershipModal()
  const endMembership = useEndGroupMembershipMutation()
  const { group } = useGroupDetailsContext()

  const openEndMembershipModal = useConfirmDeleteModal({
    title: "Avslutt medlemskap",
    text: `Er du sikker på at du vil avslutte medlemskapet for ${groupMember?.name}?`,
    confirmText: "Avslutt medlemskap",
    cancelText: "Avbryt",
    onConfirm: () => {
      endMembership.mutate({ groupId: group.slug, userId: groupMember.id })
    },
  })

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
        cell: (info) => formatDate(info.getValue().start, "dd.MM.yyyy"),
      }),
      columnHelper.accessor((membership) => membership, {
        id: "end",
        header: () => "Sluttdato",
        cell: (info) => {
          const end = info.getValue().end
          return end ? formatDate(end, "dd.MM.yyyy") : "-"
        },
      }),
      columnHelper.accessor((membership) => membership, {
        id: "actions",
        header: () => "Rediger",
        cell: (info) => {
          const membership = info.getValue()
          const isActive = membership.end === null

          if (isActive) {
            return (
              <Button color="red" variant="light" size="sm" onClick={() => openEndMembershipModal()}>
                Avslutt
              </Button>
            )
          }

          return (
            <Button
              size="sm"
              variant="subtle"
              disabled={isActive}
              onClick={() => openGroupEditModal({ groupMembership: info.getValue() })}
            >
              Rediger
            </Button>
          )
        },
      }),
    ],
    [columnHelper, openGroupEditModal, openEndMembershipModal]
  )

  return useReactTable({
    data: groupMember.groupMemberships,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
