"use client"

import { Title, Text, Button, Flex, Loader } from "@mantine/core"
import { trpc } from "../../trpc"
import { Event } from "@dotkomonline/types"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useState } from "react"
import { EventCreationModal } from "./EventCreationModal"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { GenericTable } from "../../components/GenericTable"

export default function EventPage() {
  const [isCreationOpen, setCreationOpen] = useState(false)
  const { data: events = [], isLoading } = trpc.event.all.useQuery()

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
          <EventTable events={events} />
          {isCreationOpen && <EventCreationModal close={() => setCreationOpen(false)} />}
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

  return <GenericTable table={table} />
}

type EventTableDetailsCellProps = { event: Event }

const EventTableDetailsCell: FC<EventTableDetailsCellProps> = ({ event }) => {
  return (
    <Link href={`/event/${event.id}`}>
      <Button variant="outline" leftIcon={<Icon icon="tabler:list-details" />}>
        Se detailjer
      </Button>
    </Link>
  )
}
