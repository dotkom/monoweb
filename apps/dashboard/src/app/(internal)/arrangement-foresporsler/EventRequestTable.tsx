import { DateTooltip } from "@/components/DateTooltip"
import { FilterableTable } from "@/components/molecules/FilterableTable/FilterableTable"
import {
  getEventRequestStatus,
  mapEventRequestStatusToLabel,
  mapEventTypeToLabel,
  type EventRequestWithEvent,
} from "@dotkomonline/rpc/event"
import type { Group } from "@dotkomonline/rpc/group"
import { Anchor, Button, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  eventRequests: EventRequestWithEvent[]
  interestGroups: Group[]
}

export const EventRequestTable = ({ eventRequests, interestGroups }: Props) => {
  const columnHelper = createColumnHelper<EventRequestWithEvent>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((eventRequest) => eventRequest.event.title, {
        id: "title",
        header: () => "Tittel",
        sortingFn: "alphanumeric",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/arrangementer/${info.row.original.event.id}`}>
            {info.getValue()}
          </Anchor>
        ),
      }),
      columnHelper.accessor(
        (eventRequest) => interestGroups.find((group) => group.slug === eventRequest.interestGroupId),
        {
          id: "interestGroup",
          header: () => "Interessegruppe",
          sortingFn: "alphanumeric",
          cell: (info) => (
            <Anchor component={Link} size="sm" href={`/grupper/${info.row.original.interestGroupId}`}>
              {info.getValue()?.name ?? "Ukjent interessegruppe"}
            </Anchor>
          ),
        }
      ),
      columnHelper.accessor((eventRequest) => eventRequest.createdAt, {
        id: "createdAt",
        header: () => "Opprettet",
        sortingFn: "datetime",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor((eventRequest) => eventRequest.event.start, {
        id: "start",
        header: () => "Startdato",
        sortingFn: "datetime",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor((eventRequest) => eventRequest.event.type, {
        id: "type",
        header: () => "Type",
        cell: (info) => mapEventTypeToLabel(info.getValue()),
      }),
      columnHelper.accessor((eventRequest) => getEventRequestStatus(eventRequest), {
        id: "status",
        header: () => "Status",
        cell: (info) => getEventRequestStatusLabel(info.row.original),
      }),
      columnHelper.accessor((eventRequest) => eventRequest, {
        id: "action",
        enableSorting: false,
        header: () => "Se gjennom",
        cell: (info) => (
          <Button
            variant="outline"
            size="xs"
            component={Link}
            href={`/arrangement-foresporsler/${info.row.original.id}`}
          >
            Se gjennom forespørsel
          </Button>
        ),
      }),
    ],
    [columnHelper, interestGroups]
  )

  const tableOptions = useMemo(
    () => ({
      data: eventRequests,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [eventRequests, columns]
  )

  return <FilterableTable tableOptions={tableOptions} filters={[]} />
}

const getEventRequestStatusLabel = (eventRequest: EventRequestWithEvent) => {
  const status = getEventRequestStatus(eventRequest)
  const label = mapEventRequestStatusToLabel(status)

  return (
    <Text size="sm" c={status === "PENDING" ? "yellow" : status === "REJECTED" ? "red" : "green"}>
      {label}
    </Text>
  )
}
