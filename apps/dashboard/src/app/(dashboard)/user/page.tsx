"use client"

import { Skeleton, Stack, Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { StudyYearAliases, User } from "@dotkomonline/types"
import { useMemo } from "react"
import { formatDate } from "../../../utils/format"
import { useUserAllQuery } from "../../../modules/user/queries/use-user-all-query"
import { GenericTable } from "src/components/GenericTable"
import Link from "next/link"

export default function UserPage() {
  const { users, isLoading: isUsersLoading } = useUserAllQuery()

  const columnHelper = createColumnHelper<User>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => "Bruker-ID",
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Opprettet",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("studyYear", {
        header: () => "Studieår",
        cell: (info) => StudyYearAliases[info.getValue()],
      }),
      columnHelper.accessor((user) => user, {
        id: "details",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/user/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: users,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Skeleton visible={isUsersLoading}>
      <Stack>
        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}
