"use client"

import { type WebshopPurchase } from "@dotkomonline/types"
import { Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { formatDate } from "../../utils/format"

interface Props {
  data: WebshopPurchase[]
}

export const useWebshopPurchaseTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<WebshopPurchase>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("firstName", {
        header: () => "Bruker",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("stripeProductName", {
        header: () => "Produkt",
        cell: (info) => <Text>{info.getValue().toString()}</Text>,
      }),
      columnHelper.accessor("stripePrice", {
        header: () => "Pris",
        cell: (info) => <Text>{info.getValue().toString().slice(0, -2)}</Text>,
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Dato kjøpt",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("delivered", {
        header: () => "Levert",
        cell: (info) => <Text>{info.getValue() ? "Ja" : "Nei"}</Text>,
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
