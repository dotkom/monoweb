"use client"

import { Title, Text, Table, Button, Flex, Loader } from "@mantine/core"

import { trpc } from "../../trpc"
import { Event } from "@dotkomonline/types"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useState } from "react"
import { EventDetailsModal } from "./EventDetailsModal"
import { EventCreationModal } from "./EventCreationModal"

export default function EventPage() {
  const [isCreationOpen, setCreationOpen] = useState(false)
  const { data: events = [], isLoading: isEventsLoading } = trpc.event.all.useQuery({ offset: 0, limit: 50 })
  const { data: committees = [], isLoading: isCommitteesLoading } = trpc.committee.all.useQuery({
    offset: 0,
    limit: 50,
  })
  const isLoading = isEventsLoading || isCommitteesLoading

  return (
    <Flex direction="column" p="md" gap="md">
      <div>
        <Title>Arrangmenter</Title>
        <Text>Oversikt over eksisterende arrangementer</Text>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div>
            <EventTable events={events} />
          </div>
          {isCreationOpen && <EventCreationModal committees={committees} close={() => setCreationOpen(false)} />}
          <div>
            <Button onClick={() => setCreationOpen(true)}>Opprett nytt arrangement</Button>
          </div>
        </>
      )}
    </Flex>
  )
}

type EventTableProps = { events: Event[] }

const EventTable: FC<EventTableProps> = ({ events }) => {
  const columnHelper = createColumnHelper<Event>()
  const columns = [
    columnHelper.accessor("title", {
      header: () => "Arrangementnavn",
    }),
    columnHelper.accessor("start", {
      header: () => "Startdato",
      cell: (info) => info.getValue().toLocaleDateString(),
    }),
    columnHelper.accessor("end", {
      header: () => "Sluttdato",
      cell: (info) => info.getValue().toLocaleDateString(),
    }),
    columnHelper.accessor("committeeId", {
      header: () => "Arrangør",
      cell: (info) => info.getValue() ?? "Ingen arrangør",
    }),
    columnHelper.accessor("type", {
      header: () => "Type",
    }),
    columnHelper.accessor((evt) => evt, {
      id: "actions",
      header: () => "Detaljer",
      cell: (info) => <EventTableDetailsCell event={info.getValue()} />,
    }),
  ]
  const table = useReactTable({
    data: events,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

type EventTableDetailsCellProps = { event: Event }

const EventTableDetailsCell: FC<EventTableDetailsCellProps> = ({ event }) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Detaljer
      </Button>
      {isOpen && <EventDetailsModal event={event} close={() => setOpen(false)} />}
    </>
  )
}
