"use client"

import type { GroupId, GroupMember, GroupMembership } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: GroupMember[]
  groupId: GroupId
}

function formatRoles(memberships: GroupMembership[]) {
  const latestRoles = memberships.at(0)?.roles.map((role) => role.name)
  return latestRoles?.join(", ")
}

function formatMembershipDate(date: Date | undefined | null) {
  return date ? formatDate(date, "dd.MM.yyyy") : "-"
}

export const useGroupMemberTable = ({ data, groupId }: Props) => {
  const columnHelper = createColumnHelper<GroupMember>()

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => "Navn",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((member) => member, {
        id: "roles",
        header: () => "Roller",
        cell: (info) => formatRoles(info.getValue().groupMemberships),
      }),
      columnHelper.accessor((member) => member, {
        id: "start",
        header: () => "Startdato",
        cell: (info) => formatMembershipDate(info.getValue().groupMemberships.at(0)?.start),
      }),
      columnHelper.accessor((member) => member, {
        id: "end",
        header: () => "Sluttdato",
        cell: (info) => formatMembershipDate(info.getValue().groupMemberships.at(0)?.end),
      }),
      columnHelper.accessor((role) => role, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/group/${groupId}/${info.getValue().id}`}>
            Rediger
          </Anchor>
        ),
      }),
    ],
    [columnHelper, groupId]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
