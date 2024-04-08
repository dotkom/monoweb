"use client"

import { StudyYearAliases, type StudyYears, type User } from "@dotkomonline/types"
import { Anchor, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { GenericTable } from "../../../components/GenericTable"
import { useUserAllQuery } from "../../../modules/user/queries/use-user-all-query"
import { formatDate } from "../../../utils/format"

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
        cell: (info) => StudyYearAliases[info.getValue() as keyof StudyYears],
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
