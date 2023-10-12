"use client"

import { Card, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Anchor } from "@mantine/core"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { User } from "@dotkomonline/types"
import { useMemo } from "react"
import { formatDate } from "../../../utils/format"
import { useUserAllQuery } from "../../../modules/user/queries/use-user-all-query"

export default function UserPage() {
  const { users, isLoading: isUsersLoading } = useUserAllQuery()

  const columnHelper = createColumnHelper<User>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => "User ID",
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Creation Date",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("cognitoSub", {
        header: () => "Cognito Sub",
      }),
      columnHelper.accessor((user) => user, {
        id: "details",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor size="sm" href={`/user/${info.getValue().id}`}>
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
        <Card withBorder>
          <Table>
            <TableThead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableTr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableTh key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableTh>
                  ))}
                </TableTr>
              ))}
            </TableThead>
            <TableTbody>
              {table.getRowModel().rows.map((row) => (
                <TableTr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableTd key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableTd>
                  ))}
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Card>
      </Stack>
    </Skeleton>
  )
}
