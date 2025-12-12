"use client"

import { CalendarNavigation } from "@/components/organisms/EventCalendar/CalendarNavigation"
import { EventCalendar } from "@/components/organisms/EventCalendar/EventCalendar"
import { useTRPC } from "@/utils/trpc/client"
import { type EventFilterQuery, EventTypeSchema } from "@dotkomonline/types"
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
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { EventFilters } from "./components/EventFilters"
import { EventList, EventListSkeleton, type EventListViewMode } from "./components/EventList"
import { FilterChips } from "./components/FilterChips"
import { SearchInput } from "./components/SearchInput"
import { useEventAllInfiniteQuery, useEventAllQuery } from "./components/queries"

import { IconCalendarMonth, IconFilter2, IconLayoutList, IconSearch, IconX } from "@tabler/icons-react"

type FilterType = "search" | "type" | "group" | "sort"

const EventPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchBarOpen, setSearchBarOpen] = useState(false)

  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })
  const view = searchParams.get("view") || "list"
  const year = Number.parseInt(searchParams.get("y") || now.getFullYear().toString(), 10)
  const month = Number.parseInt(searchParams.get("m") || (now.getMonth() + 1).toString(), 10) - 1 // convert to 0-based month

  const trpc = useTRPC()
  const { data: isStaff = false } = useQuery(trpc.user.isStaff.queryOptions())
  const { data: groups } = useQuery(trpc.group.all.queryOptions())

  // read filters from URL
  const searchTerm = searchParams.get("search") || ""
  const typeFiltersParam = searchParams.get("type") || ""
  const typeFilters = typeFiltersParam ? typeFiltersParam.split(",") : []
  const groupFiltersParam = searchParams.get("group") || ""
  const groupFilters = groupFiltersParam ? groupFiltersParam.split(",") : []
  const viewMode = (searchParams.get("sort") || "ATTENDANCE") as EventListViewMode

  const parsedTypeFilterResult = EventTypeSchema.array().safeParse(typeFilters)
  const parsedTypeFilters = parsedTypeFilterResult.success ? parsedTypeFilterResult.data : []

  // build filter object from url params
  const filter: EventFilterQuery = useMemo(
    () => ({
      bySearchTerm: searchTerm || undefined,
      byType: parsedTypeFilters.length > 0 ? parsedTypeFilters : undefined,
      byOrganizingGroup: groupFilters.length > 0 ? groupFilters : undefined,
    }),
    [searchTerm, parsedTypeFilters, groupFilters]
  )

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllQuery({
    filter: {
      ...filter,
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
      ...filter,
      byEndDate: {
        max: now,
        min: null,
      },
      excludingType: isStaff ? [] : undefined,
      orderBy: "desc",
    },
  })

  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }

    // remove view param if its "list" because its default
    if (params.get("view") === "list") {
      params.delete("view")
    }

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()

    // Prevent updating route if nothing has changed
    if (nextQuery === currentQuery) {
      return
    }

    router.replace(nextQuery ? `/arrangementer?${nextQuery}` : "/arrangementer", { scroll: false })
  }

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }

    if (params.get("view") === "list") {
      params.delete("view")
    }

    const queryString = params.toString()
    router.replace(queryString ? `/arrangementer?${queryString}` : "/arrangementer", { scroll: false })
  }

  const handleFilterChange = (newFilter: EventFilterQuery, newViewMode: EventListViewMode) => {
    updateURLParams({
      type: newFilter.byType && newFilter.byType.length > 0 ? newFilter.byType.join(",") : null,
      group:
        newFilter.byOrganizingGroup && newFilter.byOrganizingGroup.length > 0
          ? newFilter.byOrganizingGroup.join(",")
          : null,
      sort: newViewMode !== "ATTENDANCE" ? newViewMode : null,
    })
  }

  const handleResetFilters = () => {
    updateURLParams({
      search: null,
      type: null,
      group: null,
      sort: null,
    })
  }

  const handleRemoveFilter = (filterType: FilterType, value?: string) => {
    if (filterType === "search") {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("search")

      if (params.get("view") === "list") {
        params.delete("view")
      }

      const queryString = params.toString()
      router.replace(queryString ? `/arrangementer?${queryString}` : "/arrangementer", { scroll: false })
    } else if (filterType === "type" && value) {
      const newTypes = typeFilters.filter((t) => t !== value)
      updateURLParams({ type: newTypes.length > 0 ? newTypes.join(",") : null })
    } else if (filterType === "group" && value) {
      const newGroups = groupFilters.filter((g) => g !== value)
      updateURLParams({ group: newGroups.length > 0 ? newGroups.join(",") : null })
    } else {
      updateURLParams({ [filterType]: null })
    }
  }

  const handleViewChange = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newView === "list") {
      params.delete("view")
    } else {
      params.set("view", newView)
    }

    const queryString = params.toString()
    router.replace(queryString ? `/arrangementer?${queryString}` : "/arrangementer")
  }

  const handleCalendarChange = (newYear: number, newMonth: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", "cal")
    params.set("y", newYear.toString())
    params.set("m", (newMonth + 1).toString())
    router.replace(`/arrangementer?${params.toString()}`)
  }

  const toggleSearchBar = () => {
    setSearchBarOpen((prev) => !prev)
  }

  const groupsMemo = useMemo(() => groups ?? [], [groups])
  const hasActiveFilters = searchTerm || typeFilters.length > 0 || groupFilters.length > 0 || viewMode !== "ATTENDANCE"

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (typeFilters.length > 0) count += typeFilters.length
    if (groupFilters.length > 0) count += groupFilters.length
    if (viewMode !== "ATTENDANCE") count++
    return count
  }, [typeFilters.length, groupFilters.length, viewMode])

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <Tabs value={view} onValueChange={handleViewChange} className="w-full">
        <div className="flex flex-col flex-wrap sm:flex-row justify-between gap-4">
          <div className={cn("flex gap-2 justify-between w-full", view === "cal" ? "sm:w-fit" : "")}>
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

            {view === "list" && (
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
                      <div className="max-w-sm mx-auto pb-6">
                        <DrawerHeader className="">
                          <DrawerTitle className="flex items-center gap-2">
                            <IconFilter2 className="size-[1.25em]" />
                            Filtrer arrangementer
                          </DrawerTitle>
                        </DrawerHeader>
                        <div className="px-4 pt-4 pb-20">
                          <EventFilters
                            onChange={handleFilterChange}
                            groups={groupsMemo}
                            typeFilters={parsedTypeFilters}
                            groupFilters={groupFilters}
                            viewMode={viewMode}
                            isStaff={isStaff}
                          />
                        </div>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>

                <Button
                  onClick={toggleSearchBar}
                  className="sm:hidden w-[2.875rem] rounded-lg bg-white border border-gray-200 dark:border-none dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  {searchBarOpen ? (
                    <IconX className="size-5 flex items-center justify-center" />
                  ) : (
                    <IconSearch className="size-5 flex items-center justify-center" />
                  )}
                </Button>

                <SearchInput
                  initialValue={searchTerm}
                  onDebouncedChange={handleSearchChange}
                  className="hidden relative sm:block w-full max-w-90"
                />
              </div>
            )}
          </div>

          {view === "cal" && (
            <CalendarNavigation
              year={year}
              month={month}
              onNavigate={handleCalendarChange}
              className="flex justify-between w-full sm:max-w-max"
            />
          )}
        </div>

        {view === "list" && searchBarOpen && (
          <div className="sm:hidden mt-2 relative w-full">
            <SearchInput initialValue={searchTerm} onDebouncedChange={handleSearchChange} />
          </div>
        )}

        <TabsContent value="list" className="md:grid md:grid-cols-[15rem_auto] md:gap-[3rem] lg:gap[4rem]">
          <div className="max-md:hidden w-full scroll mt-4">
            <div className="pl-1">
              <EventFilters
                onChange={handleFilterChange}
                groups={groupsMemo}
                typeFilters={parsedTypeFilters}
                groupFilters={groupFilters}
                viewMode={viewMode}
                isStaff={isStaff}
              />
            </div>
          </div>
          <div className="mt-2">
            {hasActiveFilters && (
              <FilterChips
                searchTerm={searchTerm}
                typeFilter={typeFilters}
                groupFilters={groupFilters}
                viewMode={viewMode}
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
                  viewMode={viewMode}
                />
              )}
              {isLoading && <EventListSkeleton />}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cal">
          <EventCalendar year={year} month={month} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EventPage
