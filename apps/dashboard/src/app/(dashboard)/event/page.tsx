"use client"

import { type Event, type Committee, type EventCommittee } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { Anchor, Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { GenericTable } from "src/components/GenericTable"
import { useCommitteeAllQuery } from "src/modules/committee/queries/use-committee-all-query"
import EventCommittees from "src/components/molecules/company-name/event-committees"
import Link from "next/link"
import { useCreateEventModal } from "../../../modules/event/modals/create-event-modal"
import { useEventAllQuery } from "../../../modules/event/queries/use-event-all-query"
import { formatDate } from "../../../utils/format"

type TableColumns = Event & {
  committees: EventCommittee[]
}

function fromReferenceToObj(committees: Committee[], references: EventCommittee[]): Committee[] {
  return references
    .map((reference) => committees.find((committee) => committee.id === reference.committeeId))
    .filter(Boolean) as Committee[]
}

export default function EventPage() {
  const { events, isLoading: isEventsLoading } = useEventAllQuery()
  const { committees, isLoading: isCommitteesLoading } = useCommitteeAllQuery()
  const open = useCreateEventModal()

  const columnHelper = createColumnHelper<TableColumns>()
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
        cell: (info) => <EventCommittees committees={fromReferenceToObj(committees, info.getValue())} />,
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/event/${info.getValue().id}`}>
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
