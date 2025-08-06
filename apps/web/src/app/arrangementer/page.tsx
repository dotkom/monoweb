"use client"

import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import type { EventFilterQuery } from "@dotkomonline/types"
import { Title } from "@dotkomonline/ui"
import { getCurrentUtc } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns"
import { useState } from "react"
import { EventFilters } from "./components/EventFilters"
import { EventList, EventListSkeleton } from "./components/EventList"
import { useEventAllPagedQuery } from "./components/queries"

const EventPage = () => {
  const [filter, setFilter] = useState<EventFilterQuery>({})

  const now = roundToNearestMinutes(getCurrentUtc(), { roundingMethod: "floor" })
  const { events: futureEvents, isLoading } = useEventAllPagedQuery({
    filter: {
      ...filter,
      byEndDate: {
        max: null,
        min: now,
      },
      orderBy: "asc",
    },
    page: {
      take: 1000,
    },
  })

  const { events: pastEvents, fetchNextPage } = useEventAllPagedQuery({
    filter: {
      ...filter,
      byEndDate: {
        max: now,
        min: null,
      },
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <div className="flex flex-col gap-4">
        <EventsViewToggle active="list" />
        <EventFilters onChange={setFilter} />
        {isLoading ? (
          <EventListSkeleton />
        ) : (
          <EventList events={[...futureEvents, ...pastEvents]} fetchNextPage={fetchNextPage} />
        )}
      </div>
    </div>
  )
}

export default EventPage
