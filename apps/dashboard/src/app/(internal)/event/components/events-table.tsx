import { GenericTable } from "@/components/GenericTable"
import { type EventWithAttendance, mapEventStatusToLabel, mapEventTypeToLabel } from "@dotkomonline/types"
import { Anchor, Text, Tooltip } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import { useMemo } from "react"
import { EventHostingGroupList } from "./event-hosting-group-list"

const capitalizeFirstLetter = (string: string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

interface Props {
  events: EventWithAttendance[]
  onLoadMore?(): void
}

export const EventTable = ({ events, onLoadMore }: Props) => {
  const columnHelper = createColumnHelper<EventWithAttendance>()
  const columns = useMemo(
    () => [
      columnHelper.accessor(({ event }) => event, {
        id: "title",
        header: () => "Arrangementnavn",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/event/${info.getValue().id}`}>
            {info.getValue().title}
          </Anchor>
        ),
      }),
      columnHelper.accessor("event.start", {
        header: () => "Startdato",
        cell: (info) => {
          const longDate = formatDate(info.getValue(), "eeee dd. MMMM yyyy HH:mm", { locale: nb })
          const shortDate = formatDate(info.getValue(), "dd. MMM yyyy", { locale: nb })

          return (
            <Tooltip label={capitalizeFirstLetter(longDate)}>
              <Text size="sm" w="fit-content">
                {shortDate}
              </Text>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor(({ event }) => event, {
        id: "organizers",
        header: () => "Arrangører",
        cell: (info) => (
          <EventHostingGroupList groups={info.getValue().hostingGroups} companies={info.getValue().companies} />
        ),
      }),
      columnHelper.accessor("event.type", {
        header: () => "Type",
        cell: (info) => mapEventTypeToLabel(info.getValue()),
      }),
      columnHelper.accessor("event.status", {
        header: () => "Status",
        cell: (info) => mapEventStatusToLabel(info.getValue()),
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: events,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} onLoadMore={onLoadMore} />
}
