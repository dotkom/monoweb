"use client"

import { Event } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { Anchor, Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { GenericTable } from "src/components/GenericTable"
import { EventCommittees } from "src/components/molecules/company-name/event-committees"
import { useCreateEventModal } from "../../../modules/event/modals/create-event-modal"
import { useEventAllQuery } from "../../../modules/event/queries/use-event-all-query"
import { formatDate } from "../../../utils/format"

export default function EventPage() {
  const { events, isLoading: isEventsLoading } = useEventAllQuery()
  const open = useCreateEventModal()

  const columnHelper = createColumnHelper<Event>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: () => "Arrangementnavn",
      }),
      columnHelper.accessor("start", {
        header: () => "Startdato",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("committees", {
        header: () => "Arrangør",
        cell: (info) => <EventCommittees committees={info.getValue()} />,
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor size="sm" href={`/event/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: events,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Skeleton visible={isEventsLoading}>
      <Stack>
        <GenericTable table={table} />
        <Group justify="space-between">
          <Button onClick={open}>Opprett arrangement</Button>
          <ButtonGroup>
            <Button variant="subtle">
              <Icon icon="tabler:caret-left" />
            </Button>
            <Button variant="subtle">
              <Icon icon="tabler:caret-right" />
            </Button>
          </ButtonGroup>
        </Group>
      </Stack>
    </Skeleton>
  )
}
