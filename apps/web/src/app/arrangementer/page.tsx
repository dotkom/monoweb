"use client"

import { useQuery } from "@tanstack/react-query"
import { roundToNearestMinutes } from "date-fns"
import { useMemo, useState } from "react"
import type { EventFilterQuery } from "@dotkomonline/rpc/event"
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@dotkomonline/ui"
import { IconCalendarMonth, IconFilter2, IconLayoutList, IconSearch, IconX } from "@tabler/icons-react"
import { useTRPC } from "@/utils/trpc/client"
import { getCurrentUTC } from "@dotkomonline/utils"
import { CalendarMonthNavigation } from "./components/calendar/EventMonthCalendar/CalendarMonthNavigation"
import { EventMonthCalendar } from "./components/calendar/EventMonthCalendar/EventMonthCalendar"
import { CalendarWeekNavigation } from "./components/calendar/EventWeekCalendar/CalendarWeekNavigation"
import { EventWeekCalendar } from "./components/calendar/EventWeekCalendar/EventWeekCalendar"
import { FilterChips } from "./components/filters/FilterChips"
import { GroupFilter } from "./components/filters/GroupFilter"
import { SearchInput } from "./components/filters/SearchInput"
import { SortFilter } from "./components/filters/SortFilter"
import { TypeFilter } from "./components/filters/TypeFilter"
import { EventList, EventListSkeleton } from "./components/EventList"
import { useEventAllSummariesInfiniteQuery, useEventAllSummariesQuery } from "./components/queries"
import { useCalendarNavigation } from "./hooks/useCalendarNavigation"
import { useEventFilters } from "./hooks/useEventFilters"
import { useEventsView } from "./hooks/useEventsView"
import type { EventsView } from "./hooks/useEventsViewNavigation"
import { useEventsViewNavigation } from "./hooks/useEventsViewNavigation"

const EventPage = () => {
  const { view, isList, isCalendar } = useEventsView()
  const { navigateToView } = useEventsViewNavigation()

  const calendarNavigation = useCalendarNavigation()
  const { filters, updateFilters, resetFilters } = useEventFilters()

  const trpc = useTRPC()
  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })

  const { data: isStaff = false } = useQuery(trpc.user.isStaff.queryOptions())
  const { data: groups } = useQuery(trpc.group.all.queryOptions())

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchBarOpen, setSearchBarOpen] = useState(filters.search.length > 0)

  const queryFilter: EventFilterQuery = useMemo(
    () => ({
      bySearchTerm: filters.search || undefined,
      byType: filters.types.length > 0 ? filters.types : undefined,
      byOrganizingGroup: filters.groups.length > 0 ? filters.groups : undefined,
    }),
    [filters.search, filters.types, filters.groups]
  )

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllSummariesQuery({
    filter: {
      ...queryFilter,
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

  const { eventDetails: pastEventWithAttendances, fetchNextPage } = useEventAllSummariesInfiniteQuery({
    filter: {
      ...queryFilter,
      byEndDate: {
        max: now,
        min: null,
      },
      orderBy: "desc",
    },
  })

  const hasActiveFilters =
    filters.search || filters.types.length > 0 || filters.groups.length > 0 || filters.viewModeSort !== "ATTENDANCE"

  const activeFilterCount =
    filters.types.length + filters.groups.length + (filters.viewModeSort !== "ATTENDANCE" ? 1 : 0)

  const tabValue = isCalendar ? "calendar" : "list"

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <div className={cn("flex gap-2 justify-between", isCalendar ? "flex-wrap" : "")}>
        <div className={cn("flex gap-2", isList ? "w-full" : "")}>
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
            }}
          >
            <ToggleGroupItem value="list" className="h-full border-field-border">
              <IconLayoutList className="size-4.5 mr-1" />
              Liste
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" className="h-full border-field-border">
              <IconCalendarMonth className="size-4.5 mr-1" />
              Kalender
            </ToggleGroupItem>
          </ToggleGroup>

          {isList && (
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
                          <Text element="span" className="h-5.5 font-medium text-gray-500 dark:text-stone-400 text-sm">
                            Sorter
                          </Text>
                          <SortFilter
                            value={filters.viewModeSort}
                            onChange={(viewModeSort) => updateFilters({ viewModeSort })}
                          />
                        </div>
                        <div className="mt-6">
                          <TypeFilter
                            value={filters.types}
                            onChange={(types) => updateFilters({ types })}
                            isStaff={isStaff}
                          />
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-0">
                        <GroupFilter
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

              <SortFilter
                value={filters.viewModeSort}
                onChange={(viewModeSort) => updateFilters({ viewModeSort })}
                className="max-md:hidden"
              />
            </div>
          )}

          {isCalendar && (
            <>
              <ToggleGroup
                className="hidden xs:flex shrink-0 h-full"
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
                  Måned
                </ToggleGroupItem>
                <ToggleGroupItem value="week" className="h-full border-field-border">
                  Uke
                </ToggleGroupItem>
              </ToggleGroup>

              <div className="xs:hidden">
                <Select value={view} onValueChange={(v) => navigateToView(v as EventsView)}>
                  <SelectTrigger className="h-11.5 rounded-lg min-w-26 font-medium dark:border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg -ml-[2px] py-[2px] md:dark:border-none shadow-none min-w-26">
                    <SelectItem value="month" className="h-8 rounded-md">
                      <Text element="span">Måned</Text>
                    </SelectItem>
                    <SelectItem value="week" className="h-8 rounded-md">
                      <Text element="span">Uke</Text>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
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

      {isList && searchBarOpen && (
        <div className="sm:hidden mt-2">
          <SearchInput initialValue={filters.search} onDebouncedChange={(value) => updateFilters({ search: value })} />
        </div>
      )}

      {isList && (
        <div className="md:grid md:grid-cols-[15rem_auto] md:gap-12">
          <div className="max-md:hidden mt-4">
            <TypeFilter value={filters.types} onChange={(types) => updateFilters({ types })} isStaff={isStaff} />
            <div className="mt-6">
              <GroupFilter
                value={filters.groups}
                onChange={(groups) => updateFilters({ groups })}
                groups={groups ?? []}
              />
            </div>
          </div>

          <div className="mt-2">
            {hasActiveFilters && (
              <FilterChips
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

            <div className="mt-6">
              {!isLoading && (
                <EventList
                  futureEventWithAttendances={futureEventWithAttendances}
                  pastEventWithAttendances={pastEventWithAttendances}
                  onLoadMore={fetchNextPage}
                  viewMode={filters.viewModeSort}
                />
              )}
              {isLoading && <EventListSkeleton />}
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

export default EventPage
