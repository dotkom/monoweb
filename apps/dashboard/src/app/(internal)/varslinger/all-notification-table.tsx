import { GenericTable } from "@/components/GenericTable"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { DateTooltip } from "@/components/DateTooltip"
import { mapNotificationPayloadTypeToLabel, mapNotificationTypeToLabel, type Notification } from "@dotkomonline/rpc"

interface AllNotificationsTableProps {
  notifications: Notification[]
}

export const AllNotificationsTable = ({ notifications }: AllNotificationsTableProps) => {
  const columnHelper = createColumnHelper<Notification>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((notification) => notification.title, {
        id: "title",
        header: () => "Tittel",
        sortingFn: "alphanumeric",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/varsler/${info.row.original.id}`}>
            {info.getValue()}
          </Anchor>
        ),
      }),

      columnHelper.accessor((notification) => notification.shortDescription, {
        id: "shortDescription",
        header: () => "Kort beskrivelse",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),

      columnHelper.accessor((notification) => notification.type, {
        id: "type",
        header: () => "Type",
        cell: (info) => mapNotificationTypeToLabel(info.getValue()),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor((notification) => notification.payloadType, {
        id: "payloadType",
        header: () => "Payload type",
        cell: (info) => mapNotificationPayloadTypeToLabel(info.getValue()),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor((notification) => notification.createdAt, {
        id: "createdAt",
        header: () => "Opprettet",
        cell: (info) => <DateTooltip date={info.getValue()} />,
        sortingFn: "datetime",
      }),
    ],
    [columnHelper]
  )

  const tableOptions = useMemo(
    () => ({
      data: notifications,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [notifications, columns]
  )

  const table = useReactTable(tableOptions)
  return <GenericTable table={table} />
}
