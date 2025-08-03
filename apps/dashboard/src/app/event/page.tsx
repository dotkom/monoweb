"use client"

import { GenericTable } from "@/components/GenericTable"
import type { Event, EventType } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import {
  ActionIcon,
  ActionIconGroup,
  Anchor,
  Button,
  Group,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"
import { EventHostingGroupList } from "./components/event-hosting-group-list"
import { useEventAllQuery } from "./queries"

const mapEventTypeToLabel = (eventType: EventType) => {
  switch (eventType) {
    case "ACADEMIC":
      return "Kurs"
    case "GENERAL_ASSEMBLY":
      return "Generalforsamling"
    case "INTERNAL":
      return "Intern"
    case "OTHER":
      return "Annet"
    case "COMPANY":
      return "Bedpres"
    case "SOCIAL":
      return "Sosialt"
    case "WELCOME":
      return "Fadderuke"
    default:
      return "Ukjent"
  }
}

const capitalizeFirstLetter = (string: string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

export default function EventPage() {
  const { events, isLoading: isEventsLoading } = useEventAllQuery()
  const columnHelper = createColumnHelper<Event>()
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
        cell: (info) => {
          const longDate = formatDate(info.getValue(), "eeee dd. MMMM yyyy HH:mm")
          const shortDate = formatDate(info.getValue(), "dd. MMM yyyy")

          return (
            <Tooltip label={capitalizeFirstLetter(longDate)}>
              <Text size="sm" w="fit-content">
                {shortDate}
              </Text>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor((event) => event, {
        id: "organizers",
        header: () => "Arrangører",
        cell: (info) => (
          <EventHostingGroupList groups={info.getValue().hostingGroups} companies={info.getValue().companies} />
        ),
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
        cell: (info) => mapEventTypeToLabel(info.getValue()),
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
        <Title order={1}>Arrangementer</Title>

        <Group justify="space-between">
          <Group>
            {/* TODO: add pagination */}
            <ActionIconGroup>
              <ActionIcon variant="subtle" c="gray" size="input-sm">
                <Icon icon="tabler:arrow-left" />
              </ActionIcon>
              <ActionIcon variant="subtle" c="gray" size="input-sm">
                <Icon icon="tabler:arrow-right" />
              </ActionIcon>
            </ActionIconGroup>

            {/* TODO: add search */}
            <TextInput placeholder="Søk etter arrangementer..." size="sm" disabled />
          </Group>

          <Group>
            <Button component={Link} href="/event/register" leftSection={<Icon icon="tabler:pencil" />}>
              Nytt arrangement
            </Button>
          </Group>
        </Group>

        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}
