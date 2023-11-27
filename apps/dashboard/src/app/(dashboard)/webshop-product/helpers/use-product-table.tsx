"use client"

import { type WebshopProduct } from "@dotkomonline/types"
import { Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  data: WebshopProduct[]
}

export const useWebshopProductTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<WebshopProduct>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => "Navn",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("price", {
        header: () => "Pris",
        cell: (info) => <Text>{info.getValue().toString()}</Text>,
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
