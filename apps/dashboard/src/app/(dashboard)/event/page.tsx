"use client"

import type { EventDetail } from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import { Icon } from "@iconify/react"
import { Anchor, Button, ButtonGroup, Group as GroupContainer, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { GenericTable } from "../../../components/GenericTable"

import { EventHostingGroupList } from "./components/event-hosting-group-list"
import { useEventAllQuery } from "./queries"

export default function EventPage() {
  const { events, isLoading: isEventsLoading } = useEventAllQuery()
  const columnHelper = createColumnHelper<EventDetail>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((event) => event, {
        id: "event.title",
        header: () => "Arrangementnavn",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/event/${info.getValue().event.id}`}>
            {info.getValue().event.title}
          </Anchor>
        ),
      }),
      columnHelper.accessor("event.start", {
        header: () => "Startdato",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor((event) => event, {
        id: "organizers",
        header: () => "Arrangører",
        cell: (info) => (
          <EventHostingGroupList
            groups={info.getValue().hostingGroups}
            interestGroups={info.getValue().hostingInterestGroups}
            companies={info.getValue().hostingCompanies}
          />
        ),
      }),
      columnHelper.accessor("event.type", {
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
