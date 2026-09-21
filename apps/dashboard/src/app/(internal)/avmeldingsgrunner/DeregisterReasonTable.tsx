import { DataTable } from "@/components/DataTable"
import { DateTooltip } from "@/components/DateTooltip"
import { type DeregisterReasonWithEvent, mapDeregisterReasonTypeToLabel } from "@dotkomonline/rpc/event"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  deregisterReasons: DeregisterReasonWithEvent[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export const DeregisterReasonTable = ({
  deregisterReasons,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const columnHelper = createColumnHelper<DeregisterReasonWithEvent>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((deregisterReason) => deregisterReason.event.title, {
        id: "title",
        header: () => "Arrangement",
        cell: (info) => <TextLink href={`/arrangementer/${info.row.original.event.id}`}>{info.getValue()}</TextLink>,
      }),
      columnHelper.accessor("registeredAt", {
        header: () => "Registreringsdato",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Avmeldingsdato",
        cell: (info) => <DateTooltip date={info.getValue()} />,
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
    data: deregisterReasons,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
