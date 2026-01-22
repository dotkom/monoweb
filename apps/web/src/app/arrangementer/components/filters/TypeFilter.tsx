"use client"

import { type EventType, EventTypeSchema, mapEventTypeToLabel } from "@dotkomonline/types"
import { Checkbox, Collapsible, CollapsibleContent, CollapsibleTrigger, Label, cn } from "@dotkomonline/ui"
import { IconChevronDown } from "@tabler/icons-react"

interface TypeFilterProps {
  value: EventType[]
  onChange: (types: EventType[]) => void
  isStaff: boolean
}

export const TypeFilter = ({ value, onChange, isStaff }: TypeFilterProps) => {
  const EVENT_TYPE_OPTIONS = Object.values(EventTypeSchema.Values)
    .filter((type) => isStaff || type !== "INTERNAL")
    .map((type) => ({
      value: type,
      label: mapEventTypeToLabel(type),
    }))

  const handleToggle = (type: EventType) => {
    const newTypes = value.includes(type) ? value.filter((t) => t !== type) : [...value, type]
    onChange(newTypes)
  }

  return (
    <div className="flex flex-col gap- md:gap-1.5">
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger
          className={cn(
            "cursor-pointer w-full flex items-center justify-between gap-2 py-1 font-medium text-gray-500",
            "[&[data-state=open]>svg]:rotate-180",
            "hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          )}
        >
          <div className="flex items-center gap-2 h-5.5">
            <Label className="cursor-pointer">Kategori</Label>
            {value.length > 0 && (
              <span className="size-5.5 flex items-center justify-center text-xs bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100 rounded-full">
                {value.length}
              </span>
            )}
          </div>
          <IconChevronDown className="size-[1.25em] transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent
          className={cn(
            "overflow-hidden",
            "data-[state=open]:animate-collapsible-down",
            "data-[state=closed]:animate-collapsible-up"
          )}
        >
          <div className="flex flex-col gap-2 pt-2">
            {EVENT_TYPE_OPTIONS.map((type) => (
              <div key={type.value} className="flex items-center gap-3">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={value.includes(type.value)}
                  onCheckedChange={() => handleToggle(type.value)}
                />
                <Label htmlFor={`type-${type.value}`} className="cursor-pointer font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
