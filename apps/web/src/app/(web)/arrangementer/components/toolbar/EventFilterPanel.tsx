import type { Group } from "@dotkomonline/rpc/group"
import { PopoverInlineContent } from "@dotkomonline/ui"
import type { RefObject } from "react"
import type { EventFilters } from "../../hooks/useEventFilters"
import { EventGroupFilter } from "../filters/EventGroupFilter"
import { EventTypeFilter } from "../filters/EventTypeFilter"

interface Props {
  container: RefObject<HTMLDivElement | null>
  filters: EventFilters
  groups: Group[]
  onChange: (partial: Partial<EventFilters>) => void
}

/** Desktop filter panel below the toolbar. The third column is left empty for the sidebar's date filter */
export const EventFilterPanel = ({ container, filters, groups, onChange }: Props) => (
  <PopoverInlineContent
    container={container}
    // Focusing the collapsed panel would scroll its clipped content
    initialFocus={false}
    className={
      "group grid grid-rows-[1fr] outline-hidden transition-[grid-template-rows] duration-300 ease-out data-starting-style:grid-rows-[0fr] data-ending-style:grid-rows-[0fr]"
    }
  >
    <div className="min-h-0 overflow-hidden transition-opacity duration-200 ease-out group-data-ending-style:opacity-0">
      <div className="px-3 pb-3">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem] gap-6">
          <EventTypeFilter value={filters.types} onChange={(types) => onChange({ types })} />
          <EventGroupFilter
            value={filters.groups}
            onChange={(groups) => onChange({ groups })}
            groups={groups}
            fillHeight
          />
          <div aria-hidden="true" className="h-(--date-filter-height)" />
        </div>
      </div>
    </div>
  </PopoverInlineContent>
)
