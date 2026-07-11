"use client"

import type { EventFilterQuery, EventWithAttendance } from "@dotkomonline/rpc/event"
import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button, Group, SegmentedControl, Skeleton, Stack, Text, Title } from "@mantine/core"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { EventFilters } from "./components/event-filters"
import { EventTable } from "./components/events-table"
import { useEventAllInfiniteQuery } from "./queries"
import { interval, isWithinInterval, compareAsc } from "date-fns"

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

  const { events, isLoading: isEventsLoading, fetchNextPage } = useEventAllInfiniteQuery({ filter })

  const displayEvents = useMemo(() => {
    if (timeTab === "kommende") {
      return sortUpcomingEvents(events)
    }

    return events
  }, [events, timeTab])

  return (
    <Stack>
      <Title order={1}>Arrangementer</Title>

      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap="sm">
          <SegmentedControl
            value={timeTab}
            onChange={handleTimeTabChange}
            data={[
              { label: "Kommende", value: "kommende" },
              { label: "Tidligere", value: "tidligere" },
            ]}
          />

          <Group wrap="wrap">
            <EventFilters onChange={setSearchFilter} />

            {canUseMineFilter && (
              <SegmentedControl
                value={scopeFilter}
                onChange={handleScopeFilterChange}
                disabled={!canUseMineFilter}
                data={[
                  { label: "Alle", value: "alle" },
                  { label: "Mine", value: "mine" },
                ]}
              />
            )}

            <Text component="span" size="sm" c="dimmed">
              Viser{" "}
              {isEventsLoading ? (
                <Skeleton
                  component="span"
                  display="inline-block"
                  width="2ch"
                  height="1.25em"
                  style={{ verticalAlign: "middle" }}
                />
              ) : (
                displayEvents.length
              )}{" "}
              arrangementer
            </Text>
          </Group>
        </Stack>

        <Group>
          <PermissionTooltip allowed={canCreate}>
            <Button
              component={Link}
              href="/arrangementer/ny"
              leftSection={<IconPencil width={14} height={14} />}
              disabled={!canCreate}
            >
              Nytt arrangement
            </Button>
          </PermissionTooltip>
        </Group>
      </Group>

      <Skeleton visible={isEventsLoading}>
        <EventTable events={displayEvents} onLoadMore={fetchNextPage} dimReadOnlyRows={scopeFilter === "alle"} />
      </Skeleton>
    </Stack>
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
