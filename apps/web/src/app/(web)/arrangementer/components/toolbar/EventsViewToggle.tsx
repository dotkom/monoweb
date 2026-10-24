import { GridIcon } from "@/components/icons/GridIcon"
import { Text, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import {
  IconCalendarMonth,
  IconLayoutColumns,
  IconLayoutGrid,
  IconLayoutList,
  type TablerIcon,
} from "@tabler/icons-react"
import type { EventsView } from "../../hooks/useEventsView"

type ViewOption = { value: "cards" | "list" | "calendar"; label: string; icon: TablerIcon }

const VIEW_OPTIONS: ViewOption[] = [
  { value: "cards", label: "Kort", icon: IconLayoutGrid },
  { value: "list", label: "Liste", icon: IconLayoutList },
  { value: "calendar", label: "Kalender", icon: IconCalendarMonth },
]

const toggleGroupClassName = "shrink-0 h-10 bg-background"

interface Props {
  view: EventsView
  onChange: (view: EventsView) => void
}

export const EventsViewToggle = ({ view, onChange }: Props) => {
  const value = view === "month" || view === "week" ? "calendar" : view

  return (
    <ToggleGroup
      className={toggleGroupClassName}
      multiple={false}
      spacing={0}
      color="blue"
      value={[value]}
      onValueChange={(values) => {
        const next = values.at(0)

        if (next === "calendar") {
          onChange("month")
        } else if (next === "cards" || next === "list") {
          onChange(next)
        }
      }}
    >
      {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          aria-label={label}
          className="flex flex-row items-center gap-2 h-full border-field-border max-[474px]:justify-center max-[474px]:w-12"
        >
          <Icon className="size-4.5" />
          <Text element="span" className="max-[474px]:hidden">
            {label}
          </Text>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export const CalendarViewToggle = ({ view, onChange }: Props) => (
  <ToggleGroup
    className={toggleGroupClassName}
    multiple={false}
    spacing={0}
    color="blue"
    value={[view]}
    onValueChange={(values) => {
      const next = values.at(0)

      if (next === "month" || next === "week") {
        onChange(next)
      }
    }}
  >
    <ToggleGroupItem value="month" className="h-full border-field-border">
      <GridIcon className="size-4.5 mr-1" />
      Måned
    </ToggleGroupItem>
    <ToggleGroupItem value="week" className="h-full border-field-border">
      <IconLayoutColumns className="size-4.5 mr-1" />
      Uke
    </ToggleGroupItem>
  </ToggleGroup>
)
