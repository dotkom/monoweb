"use client"

import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import type { EventFilterQuery } from "@dotkomonline/types"
import { Title } from "@dotkomonline/ui"
import { getCurrentUtc } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns"
import { useState } from "react"
import { EventFilters } from "./components/EventFilters"
import { EventList, EventListSkeleton } from "./components/EventList"
import { useEventAllInfiniteQuery, useEventAllQuery } from "./components/queries"

const EventPage = () => {
  const now = roundToNearestMinutes(getCurrentUtc(), { roundingMethod: "floor" })
  const [filter, setFilter] = useState<EventFilterQuery>({})

  const { eventDetails: futureEventDetails, isLoading } = useEventAllQuery({
    filter: {
      ...filter,
      byEndDate: {
        max: null,
        min: now,
      },

      excludingOrganizingGroup: ["velkom"],
      orderBy: "asc",
    },
    page: {
      // There should never be a lot of future events, so we fetch them all here to support different client-side groupings
      take: 1000,
    },
  })

  const { eventDetails: pastEventDetails, fetchNextPage } = useEventAllInfiniteQuery({
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
        <EventList
          futureEventDetails={futureEventDetails}
          pastEventDetails={pastEventDetails}
          fetchNextPastEventsPage={fetchNextPage}
        />
        {isLoading && <EventListSkeleton />}
      </div>
    </div>
  )
}

export default EventPage
