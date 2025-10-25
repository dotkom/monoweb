import { GenericTable } from "@/components/GenericTable"
import { type DeregisterReasonWithEvent, mapDeregisterReasonTypeToLabel } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import { useMemo } from "react"

const capitalizeFirstLetter = (string: string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

const getFormattedDate = (date: Date) => {
  return capitalizeFirstLetter(
    formatDate(date, "eeee dd. MMMM yyyy HH:mm", {
      locale: nb,
    })
  )
}

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
        cell: (info) => {
          return getFormattedDate(info.getValue())
        },
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Avmeldingsdato",
        cell: (info) => {
          return getFormattedDate(info.getValue())
        },
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
