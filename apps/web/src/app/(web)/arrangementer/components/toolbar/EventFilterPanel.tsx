import type { Group } from "@dotkomonline/rpc/group"
import { PopoverInlineContent, cn } from "@dotkomonline/ui"
import type { RefObject } from "react"
import type { EventFilters } from "../../utils/event-filters"
import { EventGroupFilter } from "../filters/EventGroupFilter"
import { EventTypeFilter } from "../filters/EventTypeFilter"

interface EventFilterPanelProps {
  minimumHeight: number
  container: RefObject<HTMLDivElement | null>
  filters: EventFilters
  groups: Group[]
  onChange: (partial: Partial<EventFilters>) => void
}

export const EventFilterPanel = ({ minimumHeight, container, filters, groups, onChange }: EventFilterPanelProps) => (
  <PopoverInlineContent
    container={container}
    initialFocus={false}
    className={cn(
      "relative -mt-6 rounded-b-3xl border-x border-b border-gray-200 bg-gray-100 pt-6 shadow-sm outline-hidden",
      "dark:border-stone-700/30 dark:bg-stone-800",
      "[clip-path:inset(0)] will-change-[clip-path,opacity] transition-[clip-path,opacity] duration-300 ease-out motion-reduce:transition-none",
      "data-starting-style:[clip-path:inset(0_0_100%_0)] data-closed:[clip-path:inset(0_0_100%_0)] data-closed:opacity-0"
    )}
  >
    <div className="px-3 pb-3">
      {/* The third column is left empty for the sidebar's date filter */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem] gap-6" style={{ minHeight: minimumHeight }}>
        <EventTypeFilter value={filters.types} onChange={(types) => onChange({ types })} />
        <EventGroupFilter
          value={filters.groups}
          onChange={(groups) => onChange({ groups })}
          groups={groups}
          fillHeight
        />
      </div>
    </div>
  </PopoverInlineContent>
)
