"use client"

import type { GroupMember, GroupMembership } from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  groupMember: GroupMember
}

export const useMembershipTable = ({ groupMember }: Props) => {
  const columnHelper = createColumnHelper<GroupMembership>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((member) => member, {
        id: "roles",
        header: () => "Roller",
        cell: (info) =>
          info
            .getValue()
            .roles.map((role) => role.name)
            .join(", "),
      }),
      columnHelper.accessor((member) => member, {
        id: "start",
        header: () => "Startdato",
        cell: (info) => formatDate(info.getValue().start),
      }),
      columnHelper.accessor((member) => member, {
        id: "end",
        header: () => "Sluttdato",
        cell: (info) => {
          const end = info.getValue().end
          return end ? formatDate(end) : "-"
        },
      }),
    ],
    [columnHelper]
  )

  return useReactTable({
    data: groupMember.groupMemberships,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
