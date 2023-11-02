"use client"

import { type WebshopPurchase } from "@dotkomonline/types"
import { Button, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { useEditWebshopPurchaseMutation } from "./mutations/use-edit-job-listing-mutation"
import { formatDate } from "../../utils/format"

interface Props {
  data: WebshopPurchase[]
}

export const useWebshopPurchaseTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<WebshopPurchase>()
  const edit = useEditWebshopPurchaseMutation()
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
        cell: (info) => <Text>{info.getValue()}</Text>,
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Dato kjøpt",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("delivered", {
        header: () => "Levert",
        cell: (info) => <Text>{info.getValue() ? "Ja" : "Nei"}</Text>,
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <Button
            onClick={() =>
              edit.mutate({
                id: info.row.original.id,
                input: {
                  ...info.row.original,
                  delivered: !info.row.original.delivered,
                },
              })
            }
          >
            Endre status
          </Button>
        ),
      }),
    ],
    [columnHelper, edit]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
