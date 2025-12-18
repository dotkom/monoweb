"use client"

import type { EventFilterQuery } from "@dotkomonline/types"
import { Button, Group, Skeleton, Stack, Title } from "@mantine/core"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { useState } from "react"
import { EventFilters } from "./components/event-filters"
import { EventTable } from "./components/events-table"
import { useEventAllInfiniteQuery } from "./queries"

export default function EventPage() {
  const [filter, setFilter] = useState<EventFilterQuery>({})
  const { events, isLoading: isEventsLoading, fetchNextPage } = useEventAllInfiniteQuery({ filter })

  return (
    <Stack>
      <Title order={1}>Arrangementer</Title>

      <Group justify="space-between">
        <EventFilters onChange={setFilter} />

        <Group>
          <Button component={Link} href="/arrangementer/ny" leftSection={<IconPencil width={14} height={14} />}>
            Nytt arrangement
          </Button>
        </Group>
      </Group>

      <Skeleton visible={isEventsLoading}>
        <EventTable events={events} onLoadMore={fetchNextPage} />
      </Skeleton>
    </Stack>
  )
}
