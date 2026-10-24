"use client"

import { CountBadge } from "@/components/molecules/ListFilters/CountBadge"
import { SearchInput } from "@/components/molecules/ListFilters/SearchInput"
import type { Group } from "@dotkomonline/rpc/group"
import { Button, Popover, type PopoverOpenChangeDetails, PopoverTrigger, Title, cn } from "@dotkomonline/ui"
import { IconFilter2, IconSearch, IconX } from "@tabler/icons-react"
import { usePlausible } from "next-plausible"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { EventList, EventListSkeleton } from "./components/EventList"
import { EventListOptionButtons, EventListOptionsMenu } from "./components/EventListOptionsMenu"
import { EventPreview } from "./components/EventPreview"
import { CalendarMonthNavigation } from "./components/calendar/EventMonthCalendar/CalendarMonthNavigation"
import { EventMonthCalendar } from "./components/calendar/EventMonthCalendar/EventMonthCalendar"
import { CalendarWeekNavigation } from "./components/calendar/EventWeekCalendar/CalendarWeekNavigation"
import { EventWeekCalendar } from "./components/calendar/EventWeekCalendar/EventWeekCalendar"
import { EventDateFilter } from "./components/filters/EventDateFilter"
import { EventFilterChips } from "./components/filters/EventFilterChips"
import { EventSortFilter } from "./components/filters/EventSortFilter"
import { EventFilterPanel } from "./components/toolbar/EventFilterPanel"
import { EventFilterDrawer } from "./components/toolbar/EventFilterDrawer"
import { EventsToolbar } from "./components/toolbar/EventsToolbar"
import { CalendarViewToggle, EventsViewToggle } from "./components/toolbar/EventsViewToggle"
import type { EventsListViewMode } from "./hooks/eventViewCookie"
import { useCalendarNavigation } from "./hooks/useCalendarNavigation"
import { countActiveEventFilters, useEventFilters } from "./hooks/useEventFilters"
import { toEventFilterQuery, useEventListData } from "./hooks/useEventListData"
import { type EventsView, useEventsView } from "./hooks/useEventsView"
import { useStickyBar } from "./hooks/useStickyBar"

// Toolbar sticky offset and desktop height, shared with the sidebar below it.
// The sidebar is the measured date filter, plus mt-3 and the 32px option buttons below it
const layoutVariables = cn(
  "[--events-toolbar-top:calc(var(--navbar-height)+--spacing(8))] [--events-toolbar-height:--spacing(16)]",
  "[--sidebar-height:calc(var(--date-filter-height,0px)+--spacing(3)+32px)]"
)

interface Props {
  initialListViewMode: EventsListViewMode
  groups: Group[]
}

export const EventListPage = ({ initialListViewMode, groups }: Props) => {
  const plausible = usePlausible()
  const { view, setView, isCalendar } = useEventsView(initialListViewMode)
  const isListView = !isCalendar

  useEffect(() => {
    plausible("EventsView", { props: { view: isCalendar ? `calendar_${view}` : view } })
  }, [view, isCalendar, plausible])

  const calendarNavigation = useCalendarNavigation()
  const { filters, updateFilters, resetFilters } = useEventFilters()
  const queryFilter = useMemo(() => toEventFilterQuery(filters), [filters])
  const eventListData = useEventListData({ filters, queryFilter, enabled: isListView })

  // Every toolbar change updates the URL, which scrolls back to the top
  const searchParams = useSearchParams()
  const { sentinelRef, barRef, isStuck, isSettled } = useStickyBar(searchParams.toString())

  const [isSearchOpen, setIsSearchOpen] = useState(filters.search.length > 0)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const isFloating = isStuck || isPanelOpen

  const rootRef = useRef<HTMLDivElement>(null)
  const dateFilterRef = useRef<HTMLDivElement>(null)
  const panelContainerRef = useRef<HTMLDivElement>(null)

  // Clicks in the bar or date filter shouldn't close the panel
  const handlePanelOpenChange = (open: boolean, details: PopoverOpenChangeDetails) => {
    const target = details.reason === "focus-out" ? (details.event as FocusEvent).relatedTarget : details.event.target
    const isInPanelArea = target instanceof Node && [barRef, dateFilterRef].some((ref) => ref.current?.contains(target))

    if (isInPanelArea && (details.reason === "outside-press" || details.reason === "focus-out")) {
      details.cancel()
      return
    }

    setIsPanelOpen(open)
  }

  // Exposes the date filter height as a CSS variable, so the panel can leave room for it
  useEffect(() => {
    const root = rootRef.current
    const dateFilter = dateFilterRef.current

    if (!isListView || root === null || dateFilter === null) {
      return
    }

    const observer = new ResizeObserver(() => {
      root.style.setProperty("--date-filter-height", `${dateFilter.getBoundingClientRect().height}px`)
    })
    observer.observe(dateFilter)

    return () => observer.disconnect()
  }, [isListView])

  const changeView = (nextView: EventsView) => {
    setIsPanelOpen(false)
    setView(nextView)
  }

  // Sort and search live outside the panel
  const panelFilterCount = filters.types.length + filters.groups.length + (filters.date ? 1 : 0)
  const displayMode = view === "cards" ? "cards" : "list"

  return (
    <EventPreview listSubscription={eventListData.subscription}>
      <Popover open={isPanelOpen} onOpenChange={handlePanelOpenChange}>
        <div ref={rootRef} className={cn("flex flex-col", layoutVariables)}>
          <Title element="h1" size="xl">
            Arrangementer
          </Title>

          <div ref={sentinelRef} aria-hidden="true" />

          <EventsToolbar
            ref={barRef}
            isFloating={isFloating}
            isSettled={isSettled}
            panelContainerRef={isListView ? panelContainerRef : undefined}
            className={cn(
              "flex min-w-0 flex-wrap justify-between gap-x-2",
              isCalendar && "gap-y-3",
              // Makes the bar scroll away together with the sidebar. Replaces the toolbar's -mb-3, and the list
              // cancels it with a negative margin
              isListView && "md:mb-(--sidebar-height)"
            )}
          >
            <div
              className={cn(
                "flex min-w-0 gap-2",
                isCalendar ? "flex-wrap max-md:w-full max-md:justify-between" : "w-full"
              )}
            >
              <EventsViewToggle view={view} onChange={changeView} />

              {isListView && (
                <div className="ml-auto flex min-w-0 flex-1 justify-end items-stretch gap-2">
                  <SearchInput
                    initialValue={filters.search}
                    onDebouncedChange={(search) => updateFilters({ search })}
                    className="max-sm:hidden w-full min-w-0 max-w-90"
                  />

                  <EventFilterDrawer
                    filters={filters}
                    queryFilter={queryFilter}
                    groups={groups}
                    onChange={updateFilters}
                    className="md:hidden"
                  />

                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "max-md:hidden relative shrink-0 rounded-lg h-10 gap-2 max-lg:w-10 max-lg:px-0",
                          isPanelOpen && "bg-accent"
                        )}
                      />
                    }
                  >
                    <IconFilter2 className="size-5" />
                    <span className="max-lg:sr-only">Filter</span>
                    <CountBadge
                      count={panelFilterCount}
                      className="size-5 max-lg:absolute max-lg:-right-2 max-lg:-top-2"
                    />
                  </PopoverTrigger>

                  <Button
                    variant="outline"
                    size="icon-xl"
                    aria-label={isSearchOpen ? "Lukk søk" : "Åpne søk"}
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen((open) => !open)}
                    className="sm:hidden"
                  >
                    {isSearchOpen ? <IconX className="size-5" /> : <IconSearch className="size-5" />}
                  </Button>

                  <EventSortFilter
                    value={filters.sort}
                    onChange={(sort) => updateFilters({ sort })}
                    className="max-md:hidden"
                  />

                  {/* In the sidebar from md */}
                  <EventListOptionsMenu className="md:hidden" />
                </div>
              )}

              {isCalendar && <CalendarViewToggle view={view} onChange={changeView} />}
            </div>

            {view === "week" && (
              <CalendarWeekNavigation
                year={calendarNavigation.year}
                weekNumber={calendarNavigation.week}
                onNavigate={calendarNavigation.navigateWeek}
                className="max-md:w-full"
              />
            )}

            {view === "month" && (
              <CalendarMonthNavigation
                year={calendarNavigation.year}
                month={calendarNavigation.month}
                onNavigate={calendarNavigation.navigateMonth}
                className="max-md:w-full"
              />
            )}

            {isListView && (
              <div
                inert={!isSearchOpen}
                className={cn(
                  "sm:hidden grid w-full transition-[grid-template-rows] duration-200 ease-out",
                  isSearchOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="-mx-1 min-h-0 overflow-hidden">
                  <div className="px-1 pt-2 pb-0.5">
                    <SearchInput
                      initialValue={filters.search}
                      onDebouncedChange={(search) => updateFilters({ search })}
                    />
                  </div>
                </div>
              </div>
            )}
          </EventsToolbar>

          {isListView && (
            <EventFilterPanel
              container={panelContainerRef}
              filters={filters}
              groups={groups}
              onChange={updateFilters}
            />
          )}

          {isListView && (
            <div className="mt-7 md:mt-[calc(--spacing(4)-var(--sidebar-height))] md:grid md:grid-cols-[minmax(0,1fr)_18rem] md:gap-x-6">
              <div className="min-w-0 flex flex-col gap-4">
                {countActiveEventFilters(filters) > 0 && (
                  <EventFilterChips
                    filters={filters}
                    groups={groups}
                    onChange={updateFilters}
                    onResetAll={resetFilters}
                  />
                )}

                <div className="flex flex-col gap-4">
                  {eventListData.isLoading ? (
                    <EventListSkeleton displayMode={displayMode} />
                  ) : (
                    <EventList
                      futureEventWithAttendances={eventListData.futureEvents}
                      pastEventWithAttendances={eventListData.pastEvents}
                      registeredEventCount={eventListData.registeredEventCount}
                      futureLoadMore={eventListData.futureLoadMore}
                      pastLoadMore={eventListData.pastLoadMore}
                      // Already ordered by the queries
                      viewMode="CHRONOLOGICAL"
                      displayMode={displayMode}
                    />
                  )}
                </div>
              </div>

              <aside
                className={cn(
                  // Acts as the open panel's third column
                  "max-md:hidden sticky top-[calc(var(--events-toolbar-top)+var(--events-toolbar-height))] -mt-4 self-start",
                  isPanelOpen ? "z-40 max-lg:-translate-x-3" : "z-20",
                  // Stays above the filter panel until it has finished closing
                  isSettled &&
                    (isPanelOpen
                      ? "transition-[translate] duration-300 ease-out"
                      : "[transition:translate_300ms_ease-out,z-index_0s_300ms]")
                )}
              >
                <div ref={dateFilterRef}>
                  <EventDateFilter
                    filter={queryFilter}
                    value={filters.date}
                    onChange={(date) => updateFilters({ date })}
                    headerClassName={cn(
                      isSettled && "transition-opacity duration-300 ease-out",
                      // Label only shown while the filter panel is open
                      !isPanelOpen && "pointer-events-none opacity-0"
                    )}
                  />
                </div>
                {/* Hidden while the filter panel is open */}
                <div
                  inert={isPanelOpen}
                  className={cn(
                    "mt-3",
                    isSettled && "transition-opacity duration-300 ease-out",
                    isPanelOpen && "pointer-events-none opacity-0"
                  )}
                >
                  <EventListOptionButtons />
                </div>
              </aside>
            </div>
          )}

          {isCalendar && (
            <div className="mt-8">
              {view === "week" && (
                <EventWeekCalendar year={calendarNavigation.year} weekNumber={calendarNavigation.week} />
              )}
              {view === "month" && (
                <EventMonthCalendar year={calendarNavigation.year} month={calendarNavigation.month} />
              )}
            </div>
          )}
        </div>
      </Popover>
    </EventPreview>
  )
}
