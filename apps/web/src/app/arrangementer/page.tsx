"use client"

import { EventCalendar } from "@/components/organisms/EventCalendar"
import { CalendarNavigation } from "@/components/organisms/EventCalendar/CalendarNavigation"
import { useTRPC } from "@/utils/trpc/client"
import type { EventFilterQuery } from "@dotkomonline/types"
import { Icon, Tabs, TabsContent, TabsList, TabsTrigger, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { useQuery } from "@tanstack/react-query"
import { roundToNearestMinutes } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { EventFilters } from "./components/EventFilters"
import { EventList, EventListSkeleton } from "./components/EventList"
import { useEventAllInfiniteQuery, useEventAllQuery } from "./components/queries"

const EventPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })
  const [filter, setFilter] = useState<EventFilterQuery>({})

  const view = searchParams.get("view") || "list"
  const year = Number.parseInt(searchParams.get("y") || now.getFullYear().toString())
  const month = Number.parseInt(searchParams.get("m") || (now.getMonth() + 1).toString()) - 1 // Convert to 0-based month

  const trpc = useTRPC()
  const { data: isStaff = false } = useQuery(trpc.user.isStaff.queryOptions())

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllQuery({
    filter: {
      ...filter,
      byEndDate: {
        max: null,
        min: now,
      },
      excludingOrganizingGroup: ["velkom"],
      excludingType: isStaff ? [] : undefined,
      orderBy: "asc",
    },
    page: {
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
      excludingType: isStaff ? [] : undefined,
      orderBy: "desc",
    },
  })

  const handleViewChange = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newView === "list") {
      router.push("/arrangementer")
    } else {
      params.set("view", newView)
      router.push(`/arrangementer?${params.toString()}`)
    }
  }

  const handleCalendarChange = (newYear: number, newMonth: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", "cal")
    params.set("y", newYear.toString())
    params.set("m", (newMonth + 1).toString()) // Convert to 1-based month
    router.replace(`/arrangementer?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <Tabs value={view} onValueChange={handleViewChange} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="dark:border-none w-full sm:w-fit">
            <TabsTrigger value="list" className="w-full px-3 sm:w-fit min-h-0 min-w-0">
              <Icon icon="tabler:layout-list" className="mr-2 h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="cal" className="w-full px-3 sm:w-fit min-h-0 min-w-0">
              <Icon icon="tabler:calendar-month" className="mr-2 h-4 w-4" />
              Kalender
            </TabsTrigger>
          </TabsList>

          {view === "cal" && (
            <CalendarNavigation
              year={year}
              month={month}
              onNavigate={handleCalendarChange}
              className="flex justify-between w-full sm:w-fit"
            />
          )}
        </div>

        <TabsContent value="list" className="flex flex-col gap-4">
          <EventFilters onChange={setFilter} />
          {!isLoading && (
            <EventList
              futureEventWithAttendances={futureEventWithAttendances}
              pastEventWithAttendances={pastEventWithAttendances}
              onLoadMore={fetchNextPage}
            />
          )}
          {isLoading && <EventListSkeleton />}
        </TabsContent>

        <TabsContent value="cal">
          <EventCalendar year={year} month={month} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EventPage
