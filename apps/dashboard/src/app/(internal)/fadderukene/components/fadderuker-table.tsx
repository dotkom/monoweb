import { GenericTable } from "@/components/GenericTable"
import type { Fadderuke } from "@dotkomonline/rpc/fadderuke"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  fadderuker: Fadderuke[]
}

export const FadderukerTable = ({ fadderuker }: Props) => {
  const columnHelper = createColumnHelper<Fadderuke>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("year", {
        header: () => "År",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/fadderukene/${info.row.original.id}`}>
            Fadderukene {info.getValue()}
          </Anchor>
        ),
      }),
      columnHelper.accessor("eventId", {
        header: () => "Hovedarrangement",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/arrangementer/${info.getValue()}`}>
            Se arrangement
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: fadderuker,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} />
}
