"use client"

import { GridIcon } from "@/components/icons/GridIcon"
import { SearchInput } from "@/components/molecules/ListFilters/SearchInput"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import type { EventFilterQuery } from "@dotkomonline/rpc/event"
import type { Group } from "@dotkomonline/rpc/group"
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Text,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import {
  IconCalendarMonth,
  IconFilter2,
  IconLayoutColumns,
  IconLayoutGrid,
  IconLayoutList,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { roundToNearestMinutes } from "date-fns"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarMonthNavigation } from "./components/calendar/EventMonthCalendar/CalendarMonthNavigation"
import { EventMonthCalendar } from "./components/calendar/EventMonthCalendar/EventMonthCalendar"
import { CalendarWeekNavigation } from "./components/calendar/EventWeekCalendar/CalendarWeekNavigation"
import { EventWeekCalendar } from "./components/calendar/EventWeekCalendar/EventWeekCalendar"
import { CalendarSubscriptionButton } from "./components/CalendarSubscriptionButton"
import { EventList, EventListSkeleton } from "./components/EventList"
import { EventListFilterChips } from "./components/filters/EventFilterChips"
import { EventGroupFilter } from "./components/filters/EventGroupFilter"
import { EventSortFilter } from "./components/filters/EventSortFilter"
import { EventTypeFilter } from "./components/filters/EventTypeFilter"
import {
  useEventAllSummariesByAttendingUserIdInfiniteQuery,
  useEventAllSummariesInfiniteQuery,
  useFeaturedEventsInfiniteQuery,
} from "./components/queries"
import { RegisteredEventsCard } from "./components/RegisteredEventsCard"
import type { EventsListViewMode } from "./hooks/eventViewCookie"
import { useCalendarNavigation } from "./hooks/useCalendarNavigation"
import { useEventFilters } from "./hooks/useEventFilters"
import { useEventsView } from "./hooks/useEventsView"
import { useEventsViewNavigation } from "./hooks/useEventsViewNavigation"

interface Props {
  initialListViewMode: EventsListViewMode
  groups: Group[]
  isStaff: boolean
}

export const EventListPage = ({ initialListViewMode, groups, isStaff }: Props) => {
  const { view, isCards, isCalendar, setListViewMode } = useEventsView(initialListViewMode)
  const { navigateToView } = useEventsViewNavigation(setListViewMode)
  const isEventListView = !isCalendar

  const calendarNavigation = useCalendarNavigation()
  const { filters, updateFilters, resetFilters } = useEventFilters()

  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })

  const { dbUser } = useAuthenticatedUser()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchBarOpen, setSearchBarOpen] = useState(filters.search.length > 0)
  const [registeredEventsOpen, setRegisteredEventsOpen] = useState(false)

  const queryFilter: EventFilterQuery = useMemo(
    () => ({
      bySearchTerm: filters.search || undefined,
      byType: filters.types.length > 0 ? filters.types : undefined,
      byOrganizingGroup: filters.groups.length > 0 ? filters.groups : undefined,
    }),
    [filters.search, filters.types, filters.groups]
  )

  const isAttendanceSort = filters.viewModeSort === "ATTENDANCE"

  const {
    eventDetails: featuredEventWithAttendances,
    fetchNextPage: fetchNextFeaturedPage,
    hasNextPage: hasNextFeaturedPage,
    isFetchingNextPage: isFetchingNextFeaturedPage,
    isLoading: isFeaturedLoading,
  } = useFeaturedEventsInfiniteQuery({
    filter: {
      ...queryFilter,
      byEndDate: {
        max: null,
        min: now,
      },
    },
    limit: 20,
    enabled: isAttendanceSort && isEventListView,
  })

  const {
    eventDetails: futureEventSummaries,
    fetchNextPage: fetchNextFutureSummaryPage,
    hasNextPage: hasNextFutureSummaryPage,
    isFetchingNextPage: isFetchingNextFutureSummaryPage,
    isLoading: isFutureSummariesLoading,
  } = useEventAllSummariesInfiniteQuery({
    filter: {
      ...queryFilter,
      byEndDate: {
        max: null,
        min: now,
      },
      orderBy: "asc",
    },
    page: {
      take: 20,
    },
    enabled: !isAttendanceSort && isEventListView,
  })

  const futureEventWithAttendances = isAttendanceSort ? featuredEventWithAttendances : futureEventSummaries
  const hasNextFuturePage = isAttendanceSort ? hasNextFeaturedPage : hasNextFutureSummaryPage
  const isFetchingNextFuturePage = isAttendanceSort ? isFetchingNextFeaturedPage : isFetchingNextFutureSummaryPage
  const isFutureLoading = isAttendanceSort ? isFeaturedLoading : isFutureSummariesLoading

  const {
    eventDetails: registeredEvents,
    fetchNextPage: fetchNextRegisteredPage,
    hasNextPage: hasNextRegisteredPage,
    isFetchingNextPage: isFetchingNextRegisteredPage,
  } = useEventAllSummariesByAttendingUserIdInfiniteQuery({
    id: dbUser?.id ?? "",
    filter: {
      ...queryFilter,
      byEndDate: {
        max: null,
        min: now,
      },
      orderBy: "asc",
    },
    page: {
      take: 20,
    },
    enabled: Boolean(dbUser) && isEventListView,
  })

  useEffect(() => {
    if (!registeredEventsOpen || !hasNextRegisteredPage || isFetchingNextRegisteredPage) {
      return
    }

    void fetchNextRegisteredPage()
  }, [fetchNextRegisteredPage, hasNextRegisteredPage, isFetchingNextRegisteredPage, registeredEventsOpen])

  const shouldLoadPastEvents = isEventListView && !isFutureLoading && hasNextFuturePage === false
  const {
    eventDetails: pastEventWithAttendances,
    fetchNextPage: fetchNextPastPage,
    hasNextPage: hasNextPastPage,
    isFetchingNextPage: isFetchingNextPastPage,
    isLoading: isPastLoading,
  } = useEventAllSummariesInfiniteQuery({
    filter: {
      ...queryFilter,
      byEndDate: {
        max: now,
        min: null,
      },
      orderBy: "desc",
    },
    page: {
      take: 20,
    },
    enabled: shouldLoadPastEvents,
  })

  const fetchNextPage = useCallback(() => {
    if (hasNextFuturePage && !isFetchingNextFuturePage) {
      void (isAttendanceSort ? fetchNextFeaturedPage() : fetchNextFutureSummaryPage())
      return
    }

    if (hasNextPastPage && !isFetchingNextPastPage) {
      void fetchNextPastPage()
    }
  }, [
    fetchNextFeaturedPage,
    fetchNextFutureSummaryPage,
    fetchNextPastPage,
    hasNextFuturePage,
    hasNextPastPage,
    isAttendanceSort,
    isFetchingNextFuturePage,
    isFetchingNextPastPage,
  ])

  const isLoading = isFutureLoading || (futureEventWithAttendances.length === 0 && isPastLoading)

  const hasActiveFilters =
    filters.search || filters.types.length > 0 || filters.groups.length > 0 || filters.viewModeSort !== "ATTENDANCE"

  const activeFilterCount =
    filters.types.length + filters.groups.length + (filters.viewModeSort !== "ATTENDANCE" ? 1 : 0)

  const tabValue = isCalendar ? "calendar" : view

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap items-center justify-between gap-3">
        <Title element="h1" size="xl">
          Arrangementer
        </Title>
        <div className="max-sm:hidden">
          <CalendarSubscriptionButton />
        </div>
      </div>

      <div className={cn("flex min-w-0 justify-between gap-x-2 gap-y-3", isCalendar && "flex-wrap")}>
        <div className={cn("flex min-w-0 gap-2", isCalendar ? "flex-wrap" : "w-full")}>
          <ToggleGroup
            className="shrink-0 h-10"
            multiple={false}
            spacing={0}
            value={[tabValue]}
            onValueChange={(value) => {
              const nextView = value.at(0)

              if (nextView === "calendar") {
                navigateToView("month")
              }

              if (nextView === "list") {
                navigateToView("list")
              }

              if (nextView === "cards") {
                navigateToView("cards")
              }
            }}
          >
            <ToggleGroupItem
              value="cards"
              className={cn(
                "flex flex-row items-center gap-2 h-full border-field-border",
                isCalendar
                  ? "max-[450px]:justify-center max-[450px]:w-12"
                  : "max-[390px]:justify-center max-[390px]:w-12"
              )}
            >
              <IconLayoutGrid className="size-4.5" />
              <Text element="span" className={cn(isCalendar ? "max-[450px]:hidden" : "max-[390px]:hidden")}>
                Kort
              </Text>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              className={cn(
                "flex flex-row items-center gap-2 h-full border-field-border",
                isCalendar
                  ? "max-[450px]:justify-center max-[450px]:w-12"
                  : "max-[390px]:justify-center max-[390px]:w-12"
              )}
            >
              <IconLayoutList className="size-4.5" />
              <Text element="span" className={cn(isCalendar ? "max-[450px]:hidden" : "max-[390px]:hidden")}>
                Liste
              </Text>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="calendar"
              className={cn(
                "flex flex-row items-center gap-2 h-full border-field-border",
                isCalendar
                  ? "max-[450px]:justify-center max-[450px]:w-12"
                  : "max-[390px]:justify-center max-[390px]:w-12"
              )}
            >
              <IconCalendarMonth className="size-4.5" />
              <Text element="span" className={cn(isCalendar ? "max-[450px]:hidden" : "max-[390px]:hidden")}>
                Kalender
              </Text>
            </ToggleGroupItem>
          </ToggleGroup>

          {isEventListView && (
            <div className="flex justify-end items-stretch gap-2 w-full">
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} repositionInputs={false}>
                <DrawerTrigger asChild className="md:hidden">
                  <Button variant="outline" className="relative rounded-lg size-10 sm:w-fit sm:h-full">
                    <IconFilter2 className="size-5" />
                    <span className="hidden sm:block text-sm pl-1">Filter</span>
                    {activeFilterCount > 0 && (
                      <div className="absolute -right-2 -top-2 w-5 h-5 text-xs rounded-full flex items-center justify-center bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100">
                        {activeFilterCount}
                      </div>
                    )}
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="px-4 overflow-y-auto max-h-[80dvh]">
                    <DrawerHeader>
                      <DrawerTitle className="flex items-center gap-2">
                        <IconFilter2 className="size-[1.25em]" />
                        Filtrer arrangementer
                      </DrawerTitle>
                    </DrawerHeader>

                    <div className="px-4 pt-4 pb-20 sm:grid sm:grid-cols-2 sm:gap-6">
                      <div>
                        <div className="flex flex-col gap-2">
                          <Text element="span" className="h-5.5 font-medium text-sm">
                            Sorter
                          </Text>
                          <EventSortFilter
                            value={filters.viewModeSort}
                            onChange={(viewModeSort) => updateFilters({ viewModeSort })}
                          />
                        </div>
                        <div className="mt-6">
                          <EventTypeFilter
                            value={filters.types}
                            onChange={(types) => updateFilters({ types })}
                            isStaff={isStaff}
                          />
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-0">
                        <EventGroupFilter
                          value={filters.groups}
                          onChange={(groups) => updateFilters({ groups })}
                          groups={groups ?? []}
                        />
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>

              <Button
                variant="outline"
                size="icon-xl"
                onClick={() => setSearchBarOpen((v) => !v)}
                className="sm:hidden"
              >
                {searchBarOpen ? <IconX className="size-5" /> : <IconSearch className="size-5" />}
              </Button>

              <SearchInput
                initialValue={filters.search}
                onDebouncedChange={(value) => updateFilters({ search: value })}
                className="max-sm:hidden w-full max-w-90"
              />

              <EventSortFilter
                value={filters.viewModeSort}
                onChange={(viewModeSort) => updateFilters({ viewModeSort })}
                className="max-md:hidden"
              />
            </div>
          )}

          {isCalendar && (
            <ToggleGroup
              className="shrink-0 h-10"
              multiple={false}
              spacing={0}
              value={[view]}
              onValueChange={(value) => {
                const nextView = value.at(0)

                if (nextView === "month" || nextView === "week") {
                  navigateToView(nextView)
                }
              }}
            >
              <ToggleGroupItem value="month" className="h-full border-field-border">
                <GridIcon className="size-4.5 mr-1" />
                Måned
              </ToggleGroupItem>
              <ToggleGroupItem value="week" className="h-full border-field-border">
                <IconLayoutColumns className="size-4.5 mr-1" />
                Uke
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>

        {view === "week" && (
          <CalendarWeekNavigation
            year={calendarNavigation.year}
            weekNumber={calendarNavigation.week}
            onNavigate={calendarNavigation.navigateWeek}
            className="flex justify-between w-full sm:max-w-max"
          />
        )}

        {view === "month" && (
          <CalendarMonthNavigation
            year={calendarNavigation.year}
            month={calendarNavigation.month}
            onNavigate={calendarNavigation.navigateMonth}
            className="flex justify-between w-full sm:max-w-max"
          />
        )}
      </div>

      <Link
        href="/innstillinger/bruker#kalender"
        className="sm:hidden w-fit text-sm font-normal text-muted-foreground/75 underline-offset-4 hover:underline"
      >
        Vil du ha arrangementer i kalenderen?
      </Link>

      {isEventListView && searchBarOpen && (
        <div className="sm:hidden">
          <SearchInput initialValue={filters.search} onDebouncedChange={(value) => updateFilters({ search: value })} />
        </div>
      )}

      {isEventListView && (
        <div className="md:grid md:grid-cols-[15rem_auto] md:gap-8 lg:gap-12 min-w-0">
          <div className="max-md:hidden mt-4">
            <EventTypeFilter value={filters.types} onChange={(types) => updateFilters({ types })} isStaff={isStaff} />
            <div className="mt-6">
              <EventGroupFilter
                value={filters.groups}
                onChange={(groups) => updateFilters({ groups })}
                groups={groups ?? []}
              />
            </div>
          </div>

          <div className="mt-2 min-w-0">
            {hasActiveFilters && (
              <EventListFilterChips
                searchTerm={filters.search}
                typeFilter={filters.types}
                groupFilters={filters.groups}
                viewMode={filters.viewModeSort}
                groups={groups ?? []}
                onRemoveFilter={(type, value) => {
                  if (type === "search") {
                    updateFilters({ search: "" })
                  }

                  if (type === "type") {
                    updateFilters({
                      types: filters.types.filter((filterType) => filterType !== value),
                    })
                  }

                  if (type === "group") {
                    updateFilters({
                      groups: filters.groups.filter((filterGroup) => filterGroup !== value),
                    })
                  }

                  if (type === "sort") {
                    updateFilters({ viewModeSort: "ATTENDANCE" })
                  }
                }}
                onResetAll={resetFilters}
              />
            )}

            <div className="mt-6 flex flex-col gap-4">
              {dbUser && (
                <RegisteredEventsCard
                  eventsWithAttendance={registeredEvents}
                  displayMode={isCards ? "cards" : "list"}
                  userId={dbUser.id}
                  hasMoreEvents={hasNextRegisteredPage ?? false}
                  open={registeredEventsOpen}
                  onOpenChange={setRegisteredEventsOpen}
                />
              )}

              {!isLoading && (
                <EventList
                  futureEventWithAttendances={futureEventWithAttendances}
                  pastEventWithAttendances={pastEventWithAttendances}
                  onLoadMore={fetchNextPage}
                  viewMode="CHRONOLOGICAL"
                  displayMode={isCards ? "cards" : "list"}
                />
              )}
              {isLoading && <EventListSkeleton displayMode={isCards ? "cards" : "list"} />}
            </div>
          </div>
        </div>
      )}

      {isCalendar && (
        <div className="mt-4">
          {view === "week" && <EventWeekCalendar year={calendarNavigation.year} weekNumber={calendarNavigation.week} />}
          {view === "month" && <EventMonthCalendar year={calendarNavigation.year} month={calendarNavigation.month} />}
        </div>
      )}
    </div>
  )
}
