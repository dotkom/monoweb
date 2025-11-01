import { GenericTable } from "@/components/GenericTable"
import { type DeregisterReasonWithEvent, mapDeregisterReasonTypeToLabel } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: DeregisterReasonWithEvent[]
  onLoadMore: () => void
}

export const DeregisterReasonsTable = ({ data, onLoadMore }: Props) => {
  const columnHelper = createColumnHelper<DeregisterReasonWithEvent>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((deregisterReason) => deregisterReason.event.title, {
        id: "title",
        header: () => "Arrangement",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/event/${info.row.original.event.id}`}>
            {info.getValue()}
          </Anchor>
        ),
      }),
      columnHelper.accessor("registeredAt", {
        header: () => "Registreringsdato",
        cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy HH:mm"),
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Avmeldingsdato",
        cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy HH:mm"),
      }),
      columnHelper.accessor("userGrade", {
        header: () => "Klassetrinn",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("type", {
        header: () => "Grunn",
        cell: (info) => mapDeregisterReasonTypeToLabel(info.getValue()),
      }),
      columnHelper.accessor("details", {
        header: () => "Begrunnelse",
        cell: (info) => info.getValue() || "-",
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} onLoadMore={onLoadMore} />
}
