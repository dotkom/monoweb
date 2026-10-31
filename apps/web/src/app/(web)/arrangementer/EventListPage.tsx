"use client"

import type { Group } from "@dotkomonline/rpc/group"
import { Popover, type PopoverOpenChangeDetails, Title, cn } from "@dotkomonline/ui"
import { usePlausible } from "next-plausible"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { EventList, EventListSkeleton } from "./components/EventList"
import { EventListOptionButtons } from "./components/EventListOptionsMenu"
import { EventPreview } from "./components/EventPreview"
import { CalendarMonthNavigation } from "./components/calendar/EventMonthCalendar/CalendarMonthNavigation"
import { EventMonthCalendar } from "./components/calendar/EventMonthCalendar/EventMonthCalendar"
import { CalendarWeekNavigation } from "./components/calendar/EventWeekCalendar/CalendarWeekNavigation"
import { EventWeekCalendar } from "./components/calendar/EventWeekCalendar/EventWeekCalendar"
import { EventDateFilter } from "./components/filters/EventDateFilter"
import { EventFilterChips } from "./components/filters/EventFilterChips"
import { EventFilterPanel } from "./components/toolbar/EventFilterPanel"
import { EventListToolbar } from "./components/toolbar/EventListToolbar"
import type { EventsListViewMode } from "./hooks/eventViewCookie"
import { useCalendarNavigation } from "./hooks/useCalendarNavigation"
import { useEventFilters } from "./hooks/useEventFilters"
import { useEventListData } from "./hooks/useEventListData"
import { type EventsView, useEventsView } from "./hooks/useEventsView"
import { useStickyBar } from "./hooks/useStickyBar"
import { countActiveEventFilters, toEventFilterQuery } from "./utils/event-filters"

// Toolbar sticky offset and desktop height, shared with the sidebar below it.
// The sidebar is the measured date filter, plus mt-3 and the 32px option buttons below it
const layoutVariables = cn(
  "[--events-toolbar-top:calc(var(--navbar-height)+(--spacing(8)))] [--events-toolbar-height:--spacing(16)]",
  "[--sidebar-height:calc(var(--date-filter-height,0px)+(--spacing(3))+32px)]"
)

interface EventListPageProps {
  initialListViewMode: EventsListViewMode
  groups: Group[]
}

export const EventListPage = ({ initialListViewMode, groups }: EventListPageProps) => {
  const plausible = usePlausible()
  const { view, setView, isCalendar } = useEventsView(initialListViewMode)
  const isListView = !isCalendar

  useEffect(() => {
    plausible("EventsView", { props: { view: isCalendar ? `calendar_${view}` : view } })
  }, [view, isCalendar, plausible])

  const calendarNavigation = useCalendarNavigation()
  const { filters, updateFilters, resetFilters } = useEventFilters()
  const updateDateFilter = useCallback((date: string | null) => updateFilters({ date }), [updateFilters])
  const queryFilter = useMemo(() => toEventFilterQuery(filters), [filters])
  const eventListData = useEventListData({ filters, queryFilter, enabled: isListView })

  // Keep filtered results below the sticky toolbar when the URL changes.
  const searchParams = useSearchParams()
  const { sentinelRef, barRef, isStuck, isSettled } = useStickyBar(searchParams.toString())

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [dateFilterHeight, setDateFilterHeight] = useState(0)
  const isFloating = isStuck || isPanelOpen

  const rootRef = useRef<HTMLDivElement>(null)
  const dateFilterRef = useRef<HTMLDivElement>(null)
  const panelContainerRef = useRef<HTMLDivElement>(null)

  function handlePanelOpenChange(open: boolean, details: PopoverOpenChangeDetails) {
    if (details.reason === "outside-press" || details.reason === "focus-out") {
      const target = details.reason === "focus-out" ? (details.event as FocusEvent).relatedTarget : details.event.target

      // The date filter is outside the popover, but remains part of the same filter surface.
      if (target instanceof Node) {
        const isInsideToolbar = barRef.current?.contains(target)
        const isInsideDateFilter = dateFilterRef.current?.contains(target)

        if (isInsideToolbar || isInsideDateFilter) {
          details.cancel()
          return
        }
      }
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
      const height = dateFilter.getBoundingClientRect().height
      root.style.setProperty("--date-filter-height", `${height}px`)
      setDateFilterHeight(height)
    })
    observer.observe(dateFilter)

    return () => observer.disconnect()
  }, [isListView])

  function handleViewChange(nextView: EventsView) {
    setIsPanelOpen(false)
    setView(nextView)
  }

  const displayMode = view === "cards" ? "cards" : "list"

  return (
    <EventPreview listSubscription={eventListData.subscription}>
      <Popover open={isPanelOpen} onOpenChange={handlePanelOpenChange}>
        <div ref={rootRef} className={cn("flex flex-col", layoutVariables)}>
          <Title element="h1" size="xl">
            Arrangementer
          </Title>

          <div ref={sentinelRef} aria-hidden="true" />

          <EventListToolbar
            ref={barRef}
            view={view}
            onViewChange={handleViewChange}
            filters={filters}
            queryFilter={queryFilter}
            groups={groups}
            onFiltersChange={updateFilters}
            isPanelOpen={isPanelOpen}
            isFloating={isFloating}
            isSettled={isSettled}
            panelContainerRef={panelContainerRef}
          >
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
          </EventListToolbar>

          {isListView && (
            <EventFilterPanel
              minimumHeight={dateFilterHeight}
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
                      futureEvents={eventListData.futureEvents}
                      pastEvents={eventListData.pastEvents}
                      registeredEventCount={eventListData.registeredEventCount}
                      futureLoadMore={eventListData.futureLoadMore}
                      pastLoadMore={eventListData.pastLoadMore}
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
                    onChange={updateDateFilter}
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
