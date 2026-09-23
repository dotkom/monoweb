"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import type { EventFilterQuery, EventWithAttendance } from "@dotkomonline/rpc/event"
import { Button, Title, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconPencil } from "@tabler/icons-react"
import { compareAsc, interval, isWithinInterval } from "date-fns"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { EventFilters } from "./components/EventFilters"
import { EventTable } from "./components/EventTable"
import { useEventAllInfiniteQuery } from "./queries"

type TimeTab = "kommende" | "tidligere"
type ScopeFilter = "alle" | "mine"

function parseTimeTab(value: string | null): TimeTab {
  if (value === "tidligere") {
    return "tidligere"
  }

  return "kommende"
}

function parseScopeFilter(value: string | null): ScopeFilter {
  if (value === "mine") {
    return "mine"
  }

  return "alle"
}

export default function EventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchFilter, setSearchFilter] = useState<EventFilterQuery>({})

  const timeTab = parseTimeTab(searchParams.get("tab"))
  const scopeFilterFromQuery = parseScopeFilter(searchParams.get("scope"))

  const authorization = useAuthorization()
  const { canCreateEvents, isAdministrator, affiliations } = authorization
  const canCreate = canCreateEvents()

  const affiliationSlugs = useMemo(() => [...affiliations.keys()], [affiliations])
  const canUseMineFilter = !isAdministrator && affiliationSlugs.length > 0
  const scopeFilter = canUseMineFilter ? scopeFilterFromQuery : "alle"

  const handleTimeTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)

    router.replace(`/arrangementer?${params.toString()}`)
  }

  const handleScopeFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("scope", value)

    router.replace(`/arrangementer?${params.toString()}`)
  }

  const filter = useMemo((): EventFilterQuery => {
    const now = getCurrentUTC()
    const timeFilter: EventFilterQuery =
      timeTab === "kommende"
        ? { byEndDate: { min: now, max: null }, orderBy: "asc" }
        : { byEndDate: { min: null, max: now }, orderBy: "desc" }

    const mineFilter: EventFilterQuery =
      scopeFilter === "mine" && !isAdministrator && affiliationSlugs.length > 0
        ? { byOrganizingGroup: affiliationSlugs }
        : {}

    return {
      ...searchFilter,
      ...timeFilter,
      ...mineFilter,
    }
  }, [affiliationSlugs, isAdministrator, scopeFilter, searchFilter, timeTab])

  const { events, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useEventAllInfiniteQuery({ filter })

  const displayEvents = useMemo(() => {
    if (isPlaceholderData || timeTab !== "kommende") {
      return events
    }

    return sortUpcomingEvents(events)
  }, [events, isPlaceholderData, timeTab])

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Arrangementer
      </Title>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <ToggleGroup
              multiple={false}
              value={[timeTab]}
              onValueChange={(next) => {
                const value = next.at(0)
                if (value) {
                  handleTimeTabChange(value)
                }
              }}
            >
              <ToggleGroupItem value="kommende">Kommende</ToggleGroupItem>
              <ToggleGroupItem value="tidligere">Tidligere</ToggleGroupItem>
            </ToggleGroup>

            <div className="flex flex-wrap items-center gap-2">
              <EventFilters onChange={setSearchFilter} />

              {canUseMineFilter && (
                <ToggleGroup
                  multiple={false}
                  value={[scopeFilter]}
                  onValueChange={(next) => {
                    const value = next.at(0)
                    if (value) {
                      handleScopeFilterChange(value)
                    }
                  }}
                >
                  <ToggleGroupItem value="alle">Alle</ToggleGroupItem>
                  <ToggleGroupItem value="mine">Mine</ToggleGroupItem>
                </ToggleGroup>
              )}

              <span className="text-sm text-muted-foreground">
                Viser{" "}
                {isLoading ? (
                  <span className="inline-block h-[1.25em] w-[2ch] animate-pulse rounded bg-muted align-middle" />
                ) : (
                  displayEvents.length
                )}{" "}
                arrangementer
              </span>
            </div>
          </div>

          <PermissionTooltip allowed={canCreate}>
            <Button
              variant="default"
              size="lg"
              element={Link}
              href="/arrangementer/ny"
              icon={<IconPencil />}
              disabled={!canCreate}
            >
              Nytt arrangement
            </Button>
          </PermissionTooltip>
        </div>

        <EventTable
          events={displayEvents}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          dimReadOnlyRows={scopeFilter === "alle"}
        />
      </div>
    </div>
  )
}

function sortUpcomingEvents(events: EventWithAttendance[]): EventWithAttendance[] {
  const now = getCurrentUTC()

  return events.toSorted((left, right) => {
    const leftInterval = interval(left.event.start, left.event.end)
    const rightInterval = interval(right.event.start, right.event.end)

    const leftOngoing = isWithinInterval(now, leftInterval)
    const rightOngoing = isWithinInterval(now, rightInterval)

    if (leftOngoing !== rightOngoing) {
      return leftOngoing ? -1 : 1
    }

    return compareAsc(left.event.start, right.event.start)
  })
}
