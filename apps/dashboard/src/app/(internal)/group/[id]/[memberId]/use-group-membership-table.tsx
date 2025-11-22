"use client"
import { DateTooltip } from "@/components/DateTooltip"
import type { GroupMember, GroupMembership } from "@dotkomonline/types"
import { Button } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { useEditGroupMembershipModal } from "../../modals/edit-group-membership-modal"
import { useConfirmDeleteGroupMembershipModal } from "./confirm-delete-group-membership-modal"

interface Props {
  groupMember: GroupMember
}

export const useGroupMembershipTable = ({ groupMember }: Props) => {
  const columnHelper = createColumnHelper<GroupMembership>()
  const openGroupEditModal = useEditGroupMembershipModal()
  const openConfirmDeleteModal = useConfirmDeleteGroupMembershipModal()

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
        id: "actions",
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
        cell: (info) => {
          const groupMembership = info.getValue()
          const isActive = groupMembership.end === null

          const button = (
            <Button
              size="sm"
              variant="subtle"
              disabled={isActive}
              onClick={() => openConfirmDeleteModal({ groupMembership: groupMembership })()}
            >
              Slett
            </Button>
          )

          if (isActive) {
            return <Tooltip label="Du kan ikke slette et aktivt gruppemedlemskap.">{button}</Tooltip>
          }

          return button
        },
      }),
    ],
    [columnHelper, openGroupEditModal, openConfirmDeleteModal]
  )

  return useReactTable({
    data: groupMember.groupMemberships,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
