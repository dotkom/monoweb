"use client"

import { WebshopPurchase } from "@dotkomonline/types"
import { Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { useCompanyAllQuery } from "../company/queries/use-company-all-query"

interface Props {
  data: WebshopPurchase[]
}

export const useWebshopPurchaseTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<WebshopPurchase>()
  const { companies } = useCompanyAllQuery()
  const columns = useMemo(
    () => [
      columnHelper.accessor("stripeProductId", {
        header: () => "Produkt",
        cell: (info) => info.getValue().toString(),
      }),
      columnHelper.accessor("userId", {
        header: () => "Bruker",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("stripePriceId", {
        header: () => "Pris",
        cell: (info) => {
          return <Text>{info.getValue().toString()}</Text>
        },
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Tittel",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("delivered", {
        header: () => "Aktiv til",
        cell: (info) => {
          return <Text>{info.getValue() ? "Ja" : "Nei"}</Text>
        },
      }),
    ],
    [columnHelper, companies]
  )

  return useReactTable({
    data: data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
