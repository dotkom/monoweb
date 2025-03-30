"use client"

import type { Event, Group, InterestGroup } from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import { Icon } from "@iconify/react"
import { Anchor, Button, ButtonGroup, Group as GroupContainer, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import EventInterestGroups from "src/components/molecules/EventOrganizerGroups/event-interest-groups"
import { GenericTable } from "../../../components/GenericTable"
import EventHostingGroups from "../../../components/molecules/EventOrganizerGroups/event-hosting-groups"

import { useEventAllQuery } from "./queries"

type TableColumns = Event & {
  groups: Group[]
  interestGroups: InterestGroup[]
}

export default function EventPage() {
  const { events, isLoading: isEventsLoading } = useEventAllQuery()
  const columnHelper = createColumnHelper<TableColumns>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((event) => event, {
        id: "title",
        header: () => "Arrangementnavn",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/event/${info.getValue().id}`}>
            {info.getValue().title}
          </Anchor>
        ),
      }),
      columnHelper.accessor("start", {
        header: () => "Startdato",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("groups", {
        header: () => "Arrangerende komité",
        cell: (info) => <EventHostingGroups hostingGroups={info.getValue()} />,
      }),
      columnHelper.accessor("interestGroups", {
        header: () => "Arrangerende interessegruppe",
        cell: (info) => <EventInterestGroups interestGroups={info.getValue()} />,
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
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
        <GroupContainer justify="space-between">
          <Button component={Link} href="/event/register">
            Nytt arrangement
          </Button>
          <ButtonGroup>
            <Button variant="subtle">
              <Icon icon="tabler:caret-left" />
            </Button>
            <Button variant="subtle">
              <Icon icon="tabler:caret-right" />
            </Button>
          </ButtonGroup>
        </GroupContainer>
      </Stack>
    </Skeleton>
  )
}
