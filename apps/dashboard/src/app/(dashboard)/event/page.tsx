"use client"

import { Anchor, Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Event } from "@dotkomonline/types"
import { useMemo } from "react"
import { formatDate } from "../../../utils/format"
import { Icon } from "@iconify/react"
import { useCreateEventModal } from "../../../modules/event/modals/create-event-modal"
import { useCommitteeAllQuery } from "../../../modules/committee/queries/use-committee-all-query"
import { useEventAllQuery } from "../../../modules/event/queries/use-event-all-query"
import { GenericTable } from "src/components/GenericTable"

export default function EventPage() {
  const { events, isLoading: isEventsLoading } = useEventAllQuery()
  const { committees, isLoading: isCommitteesLoading } = useCommitteeAllQuery()
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
      columnHelper.accessor("committeeId", {
        header: () => "Arrangør",
        cell: (info) => {
          const match = committees.find((committee) => committee.id === info.getValue()) ?? null
          if (match !== null) {
            return (
              <Anchor size="sm" href={`/committee/${match.id}`}>
                {match.name}
              </Anchor>
            )
          }
          return "Ukjent arrangør"
        },
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
    [committees, columnHelper]
  )

  const table = useReactTable({
    data: events,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Skeleton visible={isEventsLoading || isCommitteesLoading}>
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
