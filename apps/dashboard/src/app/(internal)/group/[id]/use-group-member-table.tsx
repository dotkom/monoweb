"use client"

import type { GroupId, GroupMember, GroupMembership } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import type { admin_directory_v1 } from "googleapis"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: { groupMember: GroupMember | null; workspaceMember: admin_directory_v1.Schema$User | null }[]
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
  const columnHelper = createColumnHelper<{
    groupMember: GroupMember | null
    workspaceMember: admin_directory_v1.Schema$User | null
  }>()

  const columns = useMemo(
    () => [
      columnHelper.accessor("groupMember.name", {
        header: () => "Navn",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "roles",
        header: () => "Roller",
        cell: (info) => formatRoles(info.getValue()?.groupMemberships ?? []),
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "start",
        header: () => "Startdato",
        cell: (info) => formatMembershipDate(info.getValue()?.groupMemberships.at(0)?.start),
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "end",
        header: () => "Sluttdato",
        cell: (info) => formatMembershipDate(info.getValue()?.groupMemberships.at(0)?.end),
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => {
          const member = info.getValue()

          if (!member) {
            return <Text size="xs">-</Text>
          }

          return (
            <Anchor component={Link} size="sm" href={`/group/${groupId}/${member.id}`}>
              Rediger
            </Anchor>
          )
        },
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
