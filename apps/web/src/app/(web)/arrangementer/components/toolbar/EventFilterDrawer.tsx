import { CountBadge } from "@/components/molecules/ListFilters/CountBadge"
import { FilterSection } from "@/components/molecules/ListFilters/FilterSection"
import type { EventFilterQuery } from "@dotkomonline/rpc/event"
import type { Group } from "@dotkomonline/rpc/group"
import { Button, Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@dotkomonline/ui"
import { IconChevronsDown, IconFilter2 } from "@tabler/icons-react"
import { type EventFilters, countActiveEventFilters } from "../../utils/event-filters"
import { EventDateFilter } from "../filters/EventDateFilter"
import { EventGroupFilter } from "../filters/EventGroupFilter"
import { EventSortFilter } from "../filters/EventSortFilter"
import { EventTypeFilter } from "../filters/EventTypeFilter"

interface EventFilterDrawerProps {
  filters: EventFilters
  queryFilter: EventFilterQuery
  groups: Group[]
  onChange: (partial: Partial<EventFilters>) => void
  className?: string
}

/** Mobile filter drawer, including sort */
export const EventFilterDrawer = ({ filters, queryFilter, groups, onChange, className }: EventFilterDrawerProps) => {
  // Search has its own field
  const count = countActiveEventFilters(filters) - (filters.search ? 1 : 0)

  return (
    <Drawer>
      <DrawerTrigger
        className={className}
        render={<Button variant="outline" className="relative rounded-lg size-10" />}
      >
        <IconFilter2 className="size-4.75" />
        <span className="sr-only">Filter</span>
        <CountBadge count={count} className="absolute -right-2 -top-2 size-5" />
      </DrawerTrigger>

      <DrawerContent className="data-[swipe-direction=down]:max-h-[80dvh]">
        <DrawerHeader className="shrink-0 px-8 flex-row items-center justify-between">
          <DrawerTitle className="flex items-center gap-2">
            <IconFilter2 className="size-[1.25em]" />
            Filtrer arrangementer
          </DrawerTitle>
          <DrawerClose render={<Button variant="ghost" size="icon" aria-label="Lukk filter" />}>
            <IconChevronsDown className="size-5" />
          </DrawerClose>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 pt-4 pb-20 sm:grid sm:grid-cols-2 sm:gap-6">
          <div className="flex flex-col gap-6">
            <FilterSection title="Sorter">
              <EventSortFilter value={filters.sort} onChange={(sort) => onChange({ sort })} />
            </FilterSection>
            <EventTypeFilter value={filters.types} onChange={(types) => onChange({ types })} />
            <EventDateFilter filter={queryFilter} value={filters.date} onChange={(date) => onChange({ date })} />
          </div>

          <EventGroupFilter
            value={filters.groups}
            onChange={(groups) => onChange({ groups })}
            groups={groups}
            className="max-sm:mt-6"
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
