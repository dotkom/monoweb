"use client"

import { SearchInput } from "@/components/molecules/ListFilters/SearchInput"
import type { EventFilterQuery } from "@dotkomonline/rpc/event"
import type { Group } from "@dotkomonline/rpc/group"
import { Button, cn } from "@dotkomonline/ui"
import { IconSearch, IconX } from "@tabler/icons-react"
import { type ReactNode, type Ref, type RefObject, useRef, useState } from "react"
import { flushSync } from "react-dom"
import type { EventsView } from "../../hooks/useEventsView"
import type { EventFilters } from "../../utils/event-filters"
import { EventListOptionsMenu } from "../EventListOptionsMenu"
import { EventSortFilter } from "../filters/EventSortFilter"
import { EventFilterButton } from "./EventFilterButton"
import { EventFilterDrawer } from "./EventFilterDrawer"
import { EventsToolbar } from "./EventsToolbar"
import { CalendarViewToggle, EventsViewToggle } from "./EventsViewToggle"

interface EventListToolbarProps {
  ref: Ref<HTMLDivElement>
  view: EventsView
  onViewChange: (view: EventsView) => void
  filters: EventFilters
  queryFilter: EventFilterQuery
  groups: Group[]
  onFiltersChange: (partial: Partial<EventFilters>) => void
  isPanelOpen: boolean
  isFloating: boolean
  isSettled: boolean
  panelContainerRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}

export function EventListToolbar({
  ref,
  view,
  onViewChange,
  filters,
  queryFilter,
  groups,
  onFiltersChange,
  isPanelOpen,
  isFloating,
  isSettled,
  panelContainerRef,
  children,
}: EventListToolbarProps) {
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(filters.search.length > 0)
  const isCalendar = view === "month" || view === "week"
  const isListView = !isCalendar
  const panelFilterCount = filters.types.length + filters.groups.length + (filters.date ? 1 : 0)

  function handleSearchToggle() {
    if (isSearchOpen) {
      mobileSearchRef.current?.blur()
      setIsSearchOpen(false)
      return
    }

    // Remove inert before focusing, within the tap handler so mobile keyboards can open.
    flushSync(() => setIsSearchOpen(true))
    mobileSearchRef.current?.focus({ preventScroll: true })
  }

  return (
    <EventsToolbar
      ref={ref}
      isFloating={isFloating}
      isPanelOpen={isPanelOpen}
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
        className={cn("flex min-w-0 gap-2", isCalendar ? "flex-wrap max-md:w-full max-md:justify-between" : "w-full")}
      >
        <EventsViewToggle view={view} onChange={onViewChange} />

        {isListView && (
          <div className="ml-auto flex min-w-0 flex-1 justify-end items-stretch gap-2">
            <SearchInput
              initialValue={filters.search}
              onDebouncedChange={(search) => onFiltersChange({ search })}
              className="max-sm:hidden w-full min-w-0 max-w-90"
            />

            {/* In the sidebar from md */}
            <EventListOptionsMenu className="md:hidden" />

            <EventSortFilter
              value={filters.sort}
              onChange={(sort) => onFiltersChange({ sort })}
              className="max-md:hidden"
            />

            <EventFilterButton count={panelFilterCount} isOpen={isPanelOpen} />

            <Button
              variant="outline"
              size="icon-xl"
              aria-label={isSearchOpen ? "Lukk søk" : "Åpne søk"}
              aria-expanded={isSearchOpen}
              onClick={handleSearchToggle}
              className="sm:hidden"
            >
              {isSearchOpen ? <IconX className="size-5" /> : <IconSearch className="size-5" />}
            </Button>

            <EventFilterDrawer
              filters={filters}
              queryFilter={queryFilter}
              groups={groups}
              onChange={onFiltersChange}
              className="md:hidden"
            />
          </div>
        )}

        {isCalendar && <CalendarViewToggle view={view} onChange={onViewChange} />}
      </div>

      {children}

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
                ref={mobileSearchRef}
                initialValue={filters.search}
                onDebouncedChange={(search) => onFiltersChange({ search })}
              />
            </div>
          </div>
        </div>
      )}
    </EventsToolbar>
  )
}
