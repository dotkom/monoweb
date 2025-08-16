"use client"

import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import type { EventFilterQuery } from "@dotkomonline/types"
import { Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns"
import { useState } from "react"
import { EventFilters } from "./components/EventFilters"
import { EventList, EventListSkeleton } from "./components/EventList"
import { useEventAllInfiniteQuery, useEventAllQuery } from "./components/queries"

const EventPage = () => {
  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })
  const [filter, setFilter] = useState<EventFilterQuery>({})

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllQuery({
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

  const { eventDetails: pastEventWithAttendances, fetchNextPage } = useEventAllInfiniteQuery({
    filter: {
      ...filter,

      byEndDate: {
        max: now,
        min: null,
      },

      excludingOrganizingGroup: ["velkom"],
      orderBy: "desc",
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
          futureEventWithAttendances={futureEventWithAttendances}
          pastEventWithAttendances={pastEventWithAttendances}
          onLoadMore={fetchNextPage}
        />
        {isLoading && <EventListSkeleton />}
      </div>
    </div>
  )
}

export default EventPage
