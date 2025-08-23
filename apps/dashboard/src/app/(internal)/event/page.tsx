"use client"

import { GenericTable } from "@/components/GenericTable"
import {
  type EventFilterQuery,
  type EventStatus,
  type EventWithAttendance,
  mapEventTypeToLabel,
} from "@dotkomonline/types"
import {
  ActionIcon,
  ActionIconGroup,
  Anchor,
  Button,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core"
import { IconCaretLeft, IconCaretRight, IconPencil } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useMemo, useState } from "react"
import { EventFilters } from "./components/event-filters"
import { EventHostingGroupList } from "./components/event-hosting-group-list"
import { useEventAllQuery } from "./queries"
import { nb } from "date-fns/locale"

const mapEventStatusToLabel = (status: EventStatus) => {
  switch (status) {
    case "PUBLIC":
      return "Publisert"
    case "DRAFT":
      return "Utkast"
    case "DELETED":
      return "Slettet"
    default:
      return "Ukjent"
  }
}

const capitalizeFirstLetter = (string: string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

export default function EventPage() {
  const columnHelper = createColumnHelper<EventWithAttendance>()
  const columns = useMemo(
    () => [
      columnHelper.accessor(({ event }) => event, {
        id: "title",
        header: () => "Arrangementnavn",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/event/${info.getValue().id}`}>
            {info.getValue().title}
          </Anchor>
        ),
      }),
      columnHelper.accessor("event.start", {
        header: () => "Startdato",
        cell: (info) => {
          const longDate = formatDate(info.getValue(), "eeee dd. MMMM yyyy HH:mm", {locale: nb})
          const shortDate = formatDate(info.getValue(), "dd. MMM yyyy", {locale: nb})

          return (
            <Tooltip label={capitalizeFirstLetter(longDate)}>
              <Text size="sm" w="fit-content">
                {shortDate}
              </Text>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor(({ event }) => event, {
        id: "organizers",
        header: () => "Arrangører",
        cell: (info) => (
          <EventHostingGroupList groups={info.getValue().hostingGroups} companies={info.getValue().companies} />
        ),
      }),
      columnHelper.accessor("event.type", {
        header: () => "Type",
        cell: (info) => mapEventTypeToLabel(info.getValue()),
      }),
      columnHelper.accessor("event.status", {
        header: () => "Status",
        cell: (info) => mapEventStatusToLabel(info.getValue()),
      }),
    ],
    [columnHelper]
  )

  const [filter, setFilter] = useState<EventFilterQuery>({})
  const { events, isLoading: isEventsLoading } = useEventAllQuery({ filter })

  const table = useReactTable({
    data: events,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Skeleton visible={isEventsLoading}>
      <Stack>
        <Title order={1}>Arrangementer</Title>

        <Group justify="space-between">
          <Group>
            {/* TODO: add pagination */}
            <ActionIconGroup>
              <ActionIcon variant="subtle" c="gray" size="input-sm">
                <IconCaretLeft />
              </ActionIcon>
              <ActionIcon variant="subtle" c="gray" size="input-sm">
                <IconCaretRight />
              </ActionIcon>
            </ActionIconGroup>

            <EventFilters onChange={setFilter} />
          </Group>

          <Group>
            <Button component={Link} href="/event/register" leftSection={<IconPencil width={14} height={14} />}>
              Nytt arrangement
            </Button>
          </Group>
        </Group>

        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}
