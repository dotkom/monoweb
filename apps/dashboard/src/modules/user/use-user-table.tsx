"use client"

import type { User } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: User[]
}

export const useUserTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<User>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("firstName", {
        header: () => "Fornavn",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("lastName", {
        header: () => "Etternavn",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: () => "E-post",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
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

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
