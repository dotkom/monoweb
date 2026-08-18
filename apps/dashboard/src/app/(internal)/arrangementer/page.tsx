"use client"

import type { EventFilterQuery, EventWithAttendance } from "@dotkomonline/rpc/event"
import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button, Group, SegmentedControl, Skeleton, Stack, Text, Title } from "@mantine/core"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { useCallback, useMemo } from "react"
import { EventFilters } from "./components/event-filters"
import { EventTable } from "./components/events-table"
import { useEventFilters } from "./hooks/use-event-filters"
import { useEventAllInfiniteQuery } from "./queries"
import { interval, isWithinInterval, compareAsc } from "date-fns"

export default function EventPage() {
  const { filters, updateFilters } = useEventFilters()
  const { search: searchTerm, timeTab, scope: scopeFilterFromQuery } = filters

  const authorization = useAuthorization()
  const { canCreateEvents, isAdministrator, affiliations } = authorization
  const canCreate = canCreateEvents()

  const affiliationSlugs = useMemo(() => [...affiliations.keys()], [affiliations])
  const canUseMineFilter = !isAdministrator && affiliationSlugs.length > 0
  const scopeFilter = canUseMineFilter ? scopeFilterFromQuery : "alle"

  const handleTimeTabChange = (value: string) => {
    if (value === "kommende" || value === "tidligere") {
      updateFilters({ timeTab: value })
    }
  }

  const handleScopeFilterChange = (value: string) => {
    if (value === "alle" || value === "mine") {
      updateFilters({ scope: value })
    }
  }

  const handleSearchFilterChange = useCallback(
    (search: string) => {
      updateFilters({ search })
    },
    [updateFilters]
  )

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
      bySearchTerm: searchTerm || undefined,
      ...timeFilter,
      ...mineFilter,
    }
  }, [affiliationSlugs, isAdministrator, scopeFilter, searchTerm, timeTab])

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
        <Stack gap="sm" align="flex-start">
          <SegmentedControl
            value={timeTab}
            onChange={handleTimeTabChange}
            data={[
              { label: "Kommende", value: "kommende" },
              { label: "Tidligere", value: "tidligere" },
            ]}
          />

          <Group wrap="wrap">
            <EventFilters value={searchTerm} onChange={handleSearchFilterChange} />

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
