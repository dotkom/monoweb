"use client"

import type { MembershipApplication} from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: MembershipApplication[]
}

export const useMembershipApplicationTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<MembershipApplication>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("documentation.fullName", {
        header: () => "Navn",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("fieldOfStudy", {
        header: () => "Ønsket studieretning",
        cell: (info) => <Text>{info.getValue()}</Text>,
      }),
      columnHelper.accessor("comment", {
        header: () => "Kommentar",
        cell: (info) => <Text>{info.getValue()}</Text>,
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
