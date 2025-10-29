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
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextInput,
  Title,
  cn,
} from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { useQuery } from "@tanstack/react-query"
import { roundToNearestMinutes } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useDebounce } from "use-debounce"
import { EventFilters } from "./components/EventFilters"
import { EventList, EventListSkeleton, type EventListViewMode } from "./components/EventList"
import { FilterChips } from "./components/FilterChips"
import { useEventAllInfiniteQuery, useEventAllQuery } from "./components/queries"

const EventPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false)

  const view = searchParams.get("view") || "list"
  const year = Number.parseInt(searchParams.get("y") || now.getFullYear().toString())
  const month = Number.parseInt(searchParams.get("m") || (now.getMonth() + 1).toString()) - 1 // Convert to 0-based month

  // Read filters from URL - support multiple types and groups
  const searchTerm = searchParams.get("search") || ""
  const typeFiltersParam = searchParams.get("type") || ""
  const typeFilters = typeFiltersParam ? typeFiltersParam.split(",") : []
  const groupFiltersParam = searchParams.get("group") || ""
  const groupFilters = groupFiltersParam ? groupFiltersParam.split(",") : []
  const viewMode = (searchParams.get("sort") || "ATTENDANCE") as EventListViewMode

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [debouncedSearchTerm] = useDebounce(localSearchTerm, 300)

  const trpc = useTRPC()
  const { data: isStaff = false } = useQuery(trpc.user.isStaff.queryOptions())
  const { data: groups } = useQuery(trpc.group.all.queryOptions())

  const parsedTypeFilterResult = EventTypeSchema.array().safeParse(typeFilters)
  const parsedTypeFilters = parsedTypeFilterResult.success ? parsedTypeFilterResult.data : []

  // build filter object from url params
  const filter: EventFilterQuery = useMemo(
    () => ({
      bySearchTerm: debouncedSearchTerm || undefined,
      byType: parsedTypeFilters.length > 0 ? parsedTypeFilters : undefined,
      byOrganizingGroup: groupFilters.length > 0 ? groupFilters : undefined,
    }),
    [debouncedSearchTerm, parsedTypeFilters, groupFilters]
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

    const queryString = params.toString()
    router.replace(queryString ? `/arrangementer?${queryString}` : "/arrangementer", { scroll: false })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: should only rerender on debouncedSearchTerm change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm)
    } else {
      params.delete("search")
    }

    if (params.get("view") === "list") {
      params.delete("view")
    }

    const queryString = params.toString()
    router.replace(queryString ? `/arrangementer?${queryString}` : "/arrangementer", { scroll: false })
  }, [debouncedSearchTerm, router])

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
    setLocalSearchTerm("")
    updateURLParams({
      search: null,
      type: null,
      group: null,
      sort: null,
    })
  }

  const handleRemoveFilter = (filterType: "search" | "type" | "group" | "sort", value?: string) => {
    if (filterType === "search") {
      setLocalSearchTerm("")

      const params = new URLSearchParams(searchParams.toString())
      params.delete("search")

      // Remove view param if it's "list" (default)
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
    setIsSearchBarOpen((prev) => !prev)
  }

  const groupsMemo = useMemo(() => groups ?? [], [groups])
  const hasActiveFilters = searchTerm || typeFilters.length > 0 || groupFilters.length > 0 || viewMode !== "ATTENDANCE"

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
                <Icon icon="tabler:layout-list" width="1.25rem" height="1.25rem" className="mr-2 h-5 w-5" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="cal" className="px-3 w-fit min-w-0 min-h-0">
                <Icon icon="tabler:calendar-month" width="1.25rem" height="1.25rem" className="mr-2 h-5 w-5" />
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
                        "px-4 rounded-lg h-[2.875rem] w-[2.875rem] sm:w-fit bg-white border border-gray-200 dark:border-none dark:bg-stone-800 dark:hover:bg-stone-700"
                      )}
                    >
                      <Icon icon="tabler:filter-2" width="1.25rem" height="1.25rem" className="h-5 w-5" />
                      <span className="hidden sm:block text-sm">Filtrer</span>
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="px-4 overflow-y-auto max-h-[80dvh]">
                      <div className="max-w-sm mx-auto pb-6">
                        <DrawerHeader className="">
                          <DrawerTitle className="flex items-center gap-2">
                            <Icon icon="tabler:filter-2" className="text-lg" />
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
                  <Icon
                    className="text-lg flex items-center justify-center"
                    icon={isSearchBarOpen ? "tabler:x" : "tabler:search"}
                  />
                </Button>

                <div className="hidden relative sm:block w-full max-w-80">
                  <Icon
                    className="text-lg h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3"
                    icon="tabler:search"
                  />
                  <TextInput
                    className="pl-10 text-sm w-full h-[2.875rem] dark:border-none"
                    placeholder="Søk etter arrangementer..."
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                  />
                </div>
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

        {view === "list" && isSearchBarOpen && (
          <div className="sm:hidden mt-2 relative w-full">
            <Icon
              className="text-lg h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3"
              icon="tabler:search"
            />
            <TextInput
              className="pl-10 text-base w-full h-[2.875rem] dark:border-none"
              placeholder="Søk etter arrangementer..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
        )}

        <TabsContent value="list" className="md:grid md:grid-cols-[15rem_auto] md:gap-[3rem] lg:gap[4rem]">
          <div className="w-full scroll">
            <div className="max-md:hidden pl-2">
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
          <div className="flex flex-col gap-4 mt-2">
            {hasActiveFilters && (
              <FilterChips
                searchTerm={searchTerm}
                typeFilter={typeFilters.join(",") || ""}
                groupFilters={groupFilters}
                viewMode={viewMode}
                groups={groups ?? []}
                onRemoveFilter={handleRemoveFilter}
                onResetAll={handleResetFilters}
              />
            )}
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
        </TabsContent>

        <TabsContent value="cal">
          <EventCalendar year={year} month={month} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EventPage
