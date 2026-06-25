"use client"

import { type EventType, EventTypeSchema, mapEventTypeToLabel } from "@dotkomonline/rpc/event"
import { Checkbox, Collapsible, CollapsibleContent, CollapsibleTrigger, Label, Text, cn } from "@dotkomonline/ui"
import { IconChevronDown } from "@tabler/icons-react"

interface TypeFilterProps {
  value: EventType[]
  onChange: (types: EventType[]) => void
  isStaff: boolean
}

export const TypeFilter = ({ value, onChange, isStaff }: TypeFilterProps) => {
  const EVENT_TYPE_OPTIONS = Object.values(EventTypeSchema.enum)
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
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger
        className={cn(
          "cursor-pointer w-full flex items-center justify-between gap-2 font-medium text-gray-500",
          "[&[data-state=open]>svg]:rotate-180",
          "hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
        )}
      >
        <div className="flex items-center gap-2 h-5.5">
          <Label className="cursor-pointer text-foreground">Kategori</Label>
          {value.length > 0 && (
            <Text
              element="span"
              className="size-5.5 flex items-center justify-center text-xs bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100 rounded-full"
            >
              {value.length}
            </Text>
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
        <div className="flex flex-col pt-2">
          {EVENT_TYPE_OPTIONS.map((type) => {
            const isSelected = value.includes(type.value)

            return (
              <div key={type.value} className="flex items-center gap-3">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(type.value)}
                  className="max-md:size-4.5"
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className={cn(
                    "cursor-pointer font-normal text-base md:text-sm text-muted-foreground hover:text-foreground w-full py-1",
                    isSelected && "text-foreground"
                  )}
                >
                  {type.label}
                </Label>
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
