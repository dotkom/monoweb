"use client"

import { Title, Text, Table, Button, Flex } from "@mantine/core"

import { trpc } from "../../trpc"
import { Event } from "@dotkomonline/types"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useState } from "react"
import { EventDetailsModal } from "./EventDetailsModal"
import { EventCreationModal } from "./EventCreationModal"

export default function EventPage() {
  const [isCreationOpen, setCreationOpen] = useState(false)
  const { data: events = [], isLoading } = trpc.event.all.useQuery({ offset: 0, limit: 50 })

  return (
    <Flex direction="column" p="md" gap="md">
      <div>
        <Title>Arrangmenter</Title>
        <Text>Oversikt over eksisterende arrangementer</Text>
      </div>
      <div className="rounded bg-white shadow">{isLoading ? "Loading" : <EventTable events={events} />}</div>
      {isCreationOpen && <EventCreationModal close={() => setCreationOpen(false)} />}
      <div>
        <Button onClick={() => setCreationOpen(true)}>Opprett nytt arrangement</Button>
      </div>
    </Flex>
  )
}

type EventTableProps = { events: Event[] }

const EventTable: FC<EventTableProps> = ({ events }) => {
  const columnHelper = createColumnHelper<Event>()
  const columns = [
    columnHelper.accessor("title", {
      header: () => <td>Arrangementnavn</td>,
    }),
    columnHelper.accessor("start", {
      header: () => <td>Startdato</td>,
      cell: (info) => <td>{info.getValue().toLocaleDateString()}</td>,
    }),
    columnHelper.accessor("end", {
      header: () => <td>Sluttdato</td>,
      cell: (info) => <td>{info.getValue().toLocaleDateString()}</td>,
    }),
    columnHelper.accessor("committeeId", {
      header: () => <td>Arrangør</td>,
      cell: (info) => <td>{info.getValue() ?? "Ingen arrangør"}</td>,
    }),
    columnHelper.accessor("type", {
      header: () => <td>Type</td>,
    }),
    columnHelper.accessor((evt) => evt, {
      id: "actions",
      header: () => <td>Detaljer</td>,
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
        Detailjer
      </Button>
      {isOpen && <EventDetailsModal event={event} close={() => setOpen(false)} />}
    </>
  )
}
