"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { roundToNearestMinutes } from "date-fns"

import type { EventFilterQuery } from "@dotkomonline/types"

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Title,
  cn,
} from "@dotkomonline/ui"

import { IconCalendarMonth, IconFilter2, IconLayoutList, IconSearch, IconX } from "@tabler/icons-react"

import { getCurrentUTC } from "@dotkomonline/utils"
import { useTRPC } from "@/utils/trpc/client"

import { CalendarMonthNavigation } from "./components/calendar/EventMonthCalendar/CalendarMonthNavigation"
import { EventMonthCalendar } from "./components/calendar/EventMonthCalendar/EventMonthCalendar"

import { CalendarWeekNavigation } from "./components/calendar/EventWeekCalendar/CalendarWeekNavigation"
import { EventWeekCalendar } from "./components/calendar/EventWeekCalendar/EventWeekCalendar"

import { GroupFilter } from "./components/filters/GroupFilter"
import { SortFilter } from "./components/filters/SortFilter"
import { TypeFilter } from "./components/filters/TypeFilter"
import { FilterChips } from "./components/filters/FilterChips"
import { SearchInput } from "./components/filters/SearchInput"

import { EventList, EventListSkeleton } from "./components/EventList"
import { useEventAllInfiniteQuery, useEventAllQuery } from "./components/queries"

import { useEventFilters } from "./hooks/useEventFilters"
import { useEventsView } from "./hooks/useEventsView"
import type { EventsView } from "./hooks/useEventsViewNavigation"
import { useCalendarNavigation } from "./hooks/useCalendarNavigation"
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

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllQuery({
    filter: {
      ...queryFilter,
      byEndDate: {
        max: null,
        min: now,
      },
      excludingType: isStaff ? [] : undefined,
      orderBy: "asc",
    },
    page: {
      take: 1000,
    },
  })

  const { eventDetails: pastEventWithAttendances, fetchNextPage } = useEventAllInfiniteQuery({
    filter: {
      ...queryFilter,
      byEndDate: {
        max: now,
        min: null,
      },
      excludingType: isStaff ? [] : undefined,
      orderBy: "desc",
    },
  })

  const hasActiveFilters =
    filters.search || filters.types.length > 0 || filters.groups.length > 0 || filters.viewModeSort !== "ATTENDANCE"

  const activeFilterCount =
    filters.types.length + filters.groups.length + (filters.viewModeSort !== "ATTENDANCE" ? 1 : 0)

  // main tab value is either "list" or "cal"
  const mainTabValue = isCalendar ? "cal" : "list"

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <Tabs
        value={mainTabValue}
        onValueChange={(v) => {
          // when switching to calendar, default to month view
          if (v === "cal") {
            navigateToView("month")
          } else {
            navigateToView(v as EventsView)
          }
        }}
      >
        <div className={cn("flex gap-2 justify-between w-full", isCalendar ? "flex-wrap" : "")}>
          <div className={cn("flex gap-2", isList ? "w-full" : "")}>
            <TabsList className="dark:border-none shrink-0">
              <TabsTrigger value="list" className="px-3 w-fit min-w-0 min-h-0">
                <IconLayoutList className="mr-2 size-5" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="cal" className="px-3 w-fit min-w-0 min-h-0">
                <IconCalendarMonth className="mr-2 size-5" />
                Kalender
              </TabsTrigger>
            </TabsList>

            {isList && (
              <div className="flex justify-end gap-2 w-full">
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} repositionInputs={false}>
                  <DrawerTrigger asChild className="md:hidden">
                    <Button
                      variant="solid"
                      className="relative sm:px-4 rounded-lg h-11.5 w-11.5 sm:w-fit bg-white border border-gray-200 dark:border-none dark:bg-stone-800 dark:hover:bg-stone-700"
                    >
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
                            <span className="h-5.5 font-medium text-gray-500 dark:text-stone-400 text-sm">Sorter</span>
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
                  onClick={() => setSearchBarOpen((v) => !v)}
                  className="sm:hidden w-11.5 rounded-lg bg-white border border-gray-200 dark:border-none dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  {searchBarOpen ? <IconX className="size-5" /> : <IconSearch className="size-5" />}
                </Button>

                <SearchInput
                  initialValue={filters.search}
                  onDebouncedChange={(value) => updateFilters({ search: value })}
                  className="hidden sm:block w-full max-w-90"
                />

                <SortFilter
                  value={filters.viewModeSort}
                  onChange={(viewModeSort) => updateFilters({ viewModeSort })}
                  className="hidden md:block"
                />
              </div>
            )}

            {isCalendar && (
              <>
                <div className="hidden xs:flex gap-1 p-1.5 border border-gray-200 dark:border-none dark:bg-stone-800 rounded-lg shrink-0">
                  <button
                    type="button"
                    onClick={() => navigateToView("week")}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      view === "week"
                        ? "bg-gray-200 dark:bg-stone-600 cursor-default"
                        : "hover:bg-gray-100 dark:hover:bg-stone-700"
                    )}
                  >
                    Uke
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToView("month")}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      view === "month"
                        ? "bg-gray-200 dark:bg-stone-600 cursor-default"
                        : "hover:bg-gray-100 dark:hover:bg-stone-700"
                    )}
                  >
                    Måned
                  </button>
                </div>
                <div className="xs:hidden">
                  <Select value={view} onValueChange={(v) => navigateToView(v as EventsView)}>
                    <SelectTrigger className="h-11.5 rounded-lg min-w-26 font-medium dark:border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg -ml-[2px] py-[2px] md:dark:border-none shadow-none min-w-26">
                      <SelectItem value="week" className="h-8 rounded-md">
                        Uke
                      </SelectItem>
                      <SelectItem value="month" className="h-8 rounded-md">
                        Måned
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
            <SearchInput
              initialValue={filters.search}
              onDebouncedChange={(value) => updateFilters({ search: value })}
            />
          </div>
        )}

        <TabsContent value="list" className="md:grid md:grid-cols-[15rem_auto] md:gap-12">
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
                  if (type === "search") updateFilters({ search: "" })
                  if (type === "type")
                    updateFilters({
                      types: filters.types.filter((t) => t !== value),
                    })
                  if (type === "group")
                    updateFilters({
                      groups: filters.groups.filter((g) => g !== value),
                    })
                  if (type === "sort") updateFilters({ viewModeSort: "ATTENDANCE" })
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
        </TabsContent>

        <TabsContent value="cal">
          <div className="mt-4">
            {view === "week" && (
              <EventWeekCalendar year={calendarNavigation.year} weekNumber={calendarNavigation.week} />
            )}
            {view === "month" && <EventMonthCalendar year={calendarNavigation.year} month={calendarNavigation.month} />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EventPage
