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
  // TODO skrives om
  const [filter, setFilter] = useState<EventFilterQuery>({})
  // TODO skrives om
  const { events, isLoading: isEventsLoading, fetchNextPage } = useEventAllInfiniteQuery({ filter })

  return (
    <Stack>
      <Title order={1}>Konkurranser</Title>

      <Group justify="space-between">
        {/* TODO: skriv om */}
        <EventFilters onChange={setFilter} />

        <Group>
          <Button component={Link} href="/konkurranser/ny" leftSection={<IconPencil width={14} height={14} />}>
            Ny konkurranser
          </Button>
        </Group>
      </Group>

      <Skeleton visible={isEventsLoading}>
        {/* TODO: skriv om */}
        <EventTable events={events} onLoadMore={fetchNextPage} />
      </Skeleton>
    </Stack>
  )
}
