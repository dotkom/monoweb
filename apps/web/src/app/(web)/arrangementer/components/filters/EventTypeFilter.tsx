"use client"

import { FilterSection } from "@/components/molecules/ListFilters/FilterSection"
import { type EventType, EventTypeSchema, mapEventTypeToLabel } from "@dotkomonline/rpc/event"
import { ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"

const EVENT_TYPE_OPTIONS = EventTypeSchema.options.map((type) => ({
  value: type,
  label: mapEventTypeToLabel(type),
}))

interface EventTypeFilterProps {
  value: EventType[]
  onChange: (types: EventType[]) => void
}

export const EventTypeFilter = ({ value, onChange }: EventTypeFilterProps) => {
  return (
    <FilterSection title="Kategori" count={value.length}>
      <ToggleGroup
        multiple
        variant="outline"
        color="blue"
        size="lg"
        className="w-full flex-wrap"
        value={value}
        onValueChange={(types) => onChange(types as EventType[])}
      >
        {EVENT_TYPE_OPTIONS.map((type) => (
          <ToggleGroupItem
            key={type.value}
            value={type.value}
            indicator="check"
            className="bg-background transition-colors motion-reduce:transition-none"
          >
            {type.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FilterSection>
  )
}
