"use client"

import { CalendarNavigation } from "@/components/organisms/EventCalendar/CalendarNavigation"
import { EventCalendar } from "@/components/organisms/EventCalendar/EventCalendar"
import { useTRPC } from "@/utils/trpc/client"
import type { EventFilterQuery, EventType } from "@dotkomonline/types"
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Title,
  cn,
} from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { useQuery } from "@tanstack/react-query"
import { roundToNearestMinutes } from "date-fns"
import { useMemo, useState } from "react"
import { GroupFilter } from "./components/filters/GroupFilter"
import { SortFilter } from "./components/filters/SortFilter"
import { TypeFilter } from "./components/filters/TypeFilter"
import { EventList, EventListSkeleton } from "./components/EventList"
import { FilterChips } from "./components/filters/FilterChips"
import { SearchInput } from "./components/filters/SearchInput"
import { useEventAllInfiniteQuery, useEventAllQuery } from "./components/queries"
import { useEventFilters } from "./components/filters/useEventFilters"

import { IconCalendarMonth, IconFilter2, IconLayoutList, IconSearch, IconX } from "@tabler/icons-react"

const EventPage = () => {
  const { filters, updateFilters } = useEventFilters()
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

  const handleTypeToggle = (type: EventType) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type]
    updateFilters({ types: newTypes })
  }

  const handleGroupToggle = (group: string) => {
    const newGroups = filters.groups.includes(group)
      ? filters.groups.filter((g) => g !== group)
      : [...filters.groups, group]
    updateFilters({ groups: newGroups })
  }

  const handleRemoveFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case "search":
        updateFilters({ search: "" })
        break
      case "type":
        if (value) handleTypeToggle(value as EventType)
        break
      case "group":
        if (value) handleGroupToggle(value)
        break
      case "sort":
        updateFilters({ viewMode: "ATTENDANCE" })
        break
    }
  }

  const handleResetFilters = () => {
    updateFilters({
      search: "",
      types: [],
      groups: [],
      viewMode: "ATTENDANCE",
    })
  }

  const toggleSearchBar = () => {
    setSearchBarOpen((prev) => !prev)
  }

  const groupsMemo = useMemo(() => groups ?? [], [groups])
  const hasActiveFilters =
    filters.search || filters.types.length > 0 || filters.groups.length > 0 || filters.viewMode !== "ATTENDANCE"

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.types.length > 0) count += filters.types.length
    if (filters.groups.length > 0) count += filters.groups.length
    if (filters.viewMode !== "ATTENDANCE") count++
    return count
  }, [filters.types.length, filters.groups.length, filters.viewMode])

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <Tabs value={filters.view} onValueChange={(view) => updateFilters({ view })} className="w-full">
        <div className="flex flex-col flex-wrap sm:flex-row justify-between gap-4">
          <div className={cn("flex gap-2 justify-between w-full", filters.view === "cal" ? "sm:w-fit" : "")}>
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

            {filters.view === "list" && (
              <div className="flex justify-end gap-2 w-full">
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} repositionInputs={false}>
                  <DrawerTrigger asChild className="md:hidden">
                    <Button
                      variant="solid"
                      className={cn(
                        "relative sm:px-4 rounded-lg h-[2.875rem] w-[2.875rem] sm:w-fit bg-white border border-gray-200 dark:border-none dark:bg-stone-800 dark:hover:bg-stone-700"
                      )}
                    >
                      <IconFilter2 className="size-5" />
                      <span className="hidden sm:block text-sm">Filtrer</span>
                      {activeFilterCount > 0 && (
                        <div className="flex items-center justify-center bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100 absolute -right-2 -top-2 w-5 h-5 text-xs rounded-full">
                          {activeFilterCount}
                        </div>
                      )}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="px-4 overflow-y-auto max-h-[80dvh]">
                      <div className="mx-auto pb-6">
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
                              <SortFilter value={filters.viewMode} onChange={(viewMode) => updateFilters({ viewMode })} />
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
                              groups={groupsMemo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>

                <Button
                  onClick={toggleSearchBar}
                  className="sm:hidden w-11.5 rounded-lg bg-white border border-gray-200 dark:border-none dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  {searchBarOpen ? (
                    <IconX className="size-5 flex items-center justify-center" />
                  ) : (
                    <IconSearch className="size-5 flex items-center justify-center" />
                  )}
                </Button>

                <SearchInput
                  initialValue={filters.search}
                  onDebouncedChange={(value) => updateFilters({ search: value })}
                  className="hidden relative sm:block w-full max-w-90"
                />
                <SortFilter 
                  value={filters.viewMode} 
                  onChange={(viewMode) => updateFilters({ viewMode })} 
                  className="hidden md:block"  
                />
              </div>
            )}
          </div>

          {filters.view === "cal" && (
            <CalendarNavigation
              year={filters.year}
              month={filters.month}
              onNavigate={(year, month) => updateFilters({ view: "cal", year, month })}
              className="flex justify-between w-full sm:max-w-max"
            />
          )}
        </div>

        {filters.view === "list" && searchBarOpen && (
          <div className="sm:hidden mt-2 relative w-full">
            <SearchInput
              initialValue={filters.search}
              onDebouncedChange={(value) => updateFilters({ search: value })}
            />
          </div>
        )}

        <TabsContent value="list" className="md:grid md:grid-cols-[15rem_auto] md:gap-[3rem] lg:gap[4rem]">
          <div className="max-md:hidden w-full scroll mt-4">
            <div className="pl-1">
              <TypeFilter value={filters.types} onChange={(types) => updateFilters({ types })} isStaff={isStaff} />
              <div className="mt-6">
                <GroupFilter
                  value={filters.groups}
                  onChange={(groups) => updateFilters({ groups })}
                  groups={groupsMemo}
                />
              </div>
            </div>
          </div>
          <div className="mt-2">
            {hasActiveFilters && (
              <FilterChips
                searchTerm={filters.search}
                typeFilter={filters.types}
                groupFilters={filters.groups}
                viewMode={filters.viewMode}
                groups={groups ?? []}
                onRemoveFilter={handleRemoveFilter}
                onResetAll={handleResetFilters}
              />
            )}
            <div className="mt-6">
              {!isLoading && (
                <EventList
                  futureEventWithAttendances={futureEventWithAttendances}
                  pastEventWithAttendances={pastEventWithAttendances}
                  onLoadMore={fetchNextPage}
                  viewMode={filters.viewMode}
                />
              )}
              {isLoading && <EventListSkeleton />}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cal">
          <EventCalendar year={filters.year} month={filters.month} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EventPage
