"use client"

import { Title, Text, Table, Button, Flex, Loader } from "@mantine/core"
import { trpc } from "../../trpc"
import { Committee, Event } from "@dotkomonline/types"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useState } from "react"
import { EventDetailsContext, EventDetailsModal } from "./EventDetailsModal"
import { EventCreationModal } from "./EventCreationModal"

export default function EventPage() {
  const [isCreationOpen, setCreationOpen] = useState(false)
  const { data: events = [], isLoading: isEventsLoading } = trpc.event.all.useQuery()
  const { data: committees = [], isLoading: isCommitteesLoading } = trpc.committee.all.useQuery()
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
            <EventTable events={events} committees={committees} />
          </div>
          {isCreationOpen && <EventCreationModal close={() => setCreationOpen(false)} />}
          <div>
            <Button onClick={() => setCreationOpen(true)}>Opprett nytt arrangement</Button>
          </div>
        </>
      )}
    </Flex>
  )
}

type EventTableProps = { events: Event[]; committees: Committee[] }

const EventTable: FC<EventTableProps> = ({ events, committees }) => {
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
      cell: (info) => <EventTableDetailsCell committees={committees} event={info.getValue()} />,
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

type EventTableDetailsCellProps = { event: Event; committees: Committee[] }

const EventTableDetailsCell: FC<EventTableDetailsCellProps> = ({ event }) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Detaljer
      </Button>
      {isOpen && (
        <EventDetailsContext.Provider value={{ event }}>
          <EventDetailsModal close={() => setOpen(false)} />
        </EventDetailsContext.Provider>
      )}
    </>
  )
}
