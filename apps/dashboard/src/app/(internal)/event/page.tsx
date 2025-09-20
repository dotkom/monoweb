"use client"

import { GenericTable } from "@/components/GenericTable"
import {
  type EventFilterQuery,
  type EventStatus,
  type EventWithAttendance,
  getAttendanceCapacity,
  getReservedAttendeeCount,
  getUnreservedAttendeeCount,
  mapEventTypeToLabel,
} from "@dotkomonline/types"
import { Anchor, AspectRatio, Badge, Button, Group, Image, Skeleton, Stack, Text, Title, Tooltip } from "@mantine/core"
import { IconArrowUpRight, IconPencil } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate, formatDistanceToNowStrict, isFuture, isPast } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import { useMemo, useState } from "react"
import { EventFilters } from "./components/event-filters"
import { EventHostingGroupList } from "./components/event-hosting-group-list"
import { useEventAllInfiniteQuery } from "./queries"

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
      columnHelper.accessor(({ event }) => event.title, {
        id: "title",
        header: () => "Arrangement",
        cell: (info) => {
          const event = info.row.original.event

          return (
            <Anchor component={Link} size="sm" href={`/event/${event.id}`}>
              <Group>
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={event.imageUrl}
                    height={48}
                    radius="var(--mantine-radius-sm)"
                    style={{ filter: isPast(event.end) ? "grayscale(50%) opacity(50%)" : undefined }}
                  />
                </AspectRatio>
                <Text>{event.title}</Text>
              </Group>
            </Anchor>
          )
        },
      }),
      columnHelper.accessor("event.start", {
        header: () => "Startdato",
        cell: (info) => {
          const event = info.row.original.event

          const longDate = formatDate(info.getValue(), "EEEE dd. MMMM yyyy 'kl.' HH:mm O", { locale: nb })
          const shortDate = formatDate(info.getValue(), "yyyy-MM-dd 'kl.' HH:mm", { locale: nb })
          const relative = formatDistanceToNowStrict(info.getValue(), { addSuffix: true, locale: nb })

          return (
            <Tooltip label={capitalizeFirstLetter(longDate)}>
              <Stack gap={0} w="fit-content" c={isPast(event.end) ? "gray" : undefined}>
                <Text size="sm">{shortDate}</Text>
                <Text size="xs">{capitalizeFirstLetter(relative)}</Text>
              </Stack>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor("attendance", {
        id: "attendance",
        header: () => "Påmelding",
        cell: (info) => {
          const attendance = info.getValue()
          const event = info.row.original.event

          const reserved = attendance && getReservedAttendeeCount(attendance)
          const unreserved = attendance && getUnreservedAttendeeCount(attendance)
          const capacity = attendance && getAttendanceCapacity(attendance)

          const beforeStart = attendance && isFuture(attendance.registerStart)
          const ongoing = attendance && !beforeStart && !isPast(attendance.registerEnd)

          return (
            <Anchor href={`/event/${event.id}&tab=pamelding`} underline="never">
              <Stack gap={4} px={12} py={6} bg="gray.2" w="fit-content" style={{borderRadius: "var(--mantine-radius-sm)"}}>
                <Group gap={4}>
                  {attendance?.pools.length ? (
                    <Badge
                      color={ongoing || beforeStart ? "dark" : "gray"}
                      variant={beforeStart ? "light" : ongoing ? "filled" : "outline"}
                    >
                      {reserved}
                      {capacity ? `/${capacity}` : null}
                      {unreserved ? ` +${unreserved}` : null}
                    </Badge>
                  ) : attendance ? (
                    <Badge color="red" variant="filled">
                      Ingen grupper
                    </Badge>
                  ) : (
                    <Badge color="gray" variant="outline">
                      Nei
                    </Badge>
                  )}
                  {attendance?.attendancePrice ? (
                    <Badge color="dark" variant="filled">
                      {attendance.attendancePrice} kr
                    </Badge>
                  ) : null}
                </Group>
                <Group gap={4}>
                <Text c="gray" size="xs">Til påmelding</Text>
                  <IconArrowUpRight color="var(--mantine-color-gray-6)" size={14} />
                </Group>
              </Stack>
            </Anchor>
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
  const { events, isLoading: isEventsLoading, fetchNextPage } = useEventAllInfiniteQuery({ filter })

  const table = useReactTable({
    data: events,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Stack>
      <Title order={1}>Arrangementer</Title>

      <Group justify="space-between">
        <EventFilters onChange={setFilter} />

        <Group>
          <Button component={Link} href="/event/register" leftSection={<IconPencil width={14} height={14} />}>
            Nytt arrangement
          </Button>
        </Group>
      </Group>

      <Skeleton visible={isEventsLoading}>
        <GenericTable table={table} onLoadMore={fetchNextPage} maxHeight={800} />
      </Skeleton>
    </Stack>
  )
}
