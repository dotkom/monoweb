import { FilterSection } from "@/components/molecules/ListFilters/FilterSection"
import type { EventFilterQuery } from "@dotkomonline/rpc/event"
import { cn } from "@dotkomonline/ui"
import { memo, useDeferredValue } from "react"
import { EventListCalendar } from "../EventListCalendar"

const MemoizedEventListCalendar = memo(EventListCalendar)

interface EventDateFilterProps {
  filter: EventFilterQuery
  value: string | null
  onChange: (date: string | null) => void
  headerClassName?: string
  className?: string
}

export const EventDateFilter = ({ filter, value, onChange, headerClassName, className }: EventDateFilterProps) => {
  const deferredFilter = useDeferredValue(filter)

  return (
    <FilterSection
      title="Dato"
      count={value ? 1 : 0}
      className={cn("max-w-md", className)}
      headerClassName={headerClassName}
    >
      <MemoizedEventListCalendar filter={deferredFilter} selectedDate={value} onSelectDate={onChange} />
    </FilterSection>
  )
}
