"use client"

import {
  cn,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@dotkomonline/ui"
import type { EventListOrder } from "../EventList"
import { IconCalendar, IconUsersPlus } from "@tabler/icons-react"

const orderingOptions = [
  { value: "ATTENDANCE", label: "Påmelding", icon: IconUsersPlus },
  { value: "CHRONOLOGICAL", label: "Dato", icon: IconCalendar },
] as const

interface OrderSelectProps {
  value: EventListOrder
  onChange: (mode: EventListOrder) => void
  className?: string
}

export const OrderSelect = ({ value, onChange, className }: OrderSelectProps) => {
  return (
    <div className={cn("h-full self-stretch", className)}>
      <Select
        items={orderingOptions}
        value={value}
        onValueChange={(selectedValue) => onChange(selectedValue as EventListOrder)}
      >
        <SelectTrigger className="rounded-lg min-w-43 font-normal h-10 md:h-full!">
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground max-md:hidden">Sorter:</span>
            <SelectValue className="font-medium text-foreground" />
          </span>
        </SelectTrigger>
        <SelectContent position="popper" className="rounded-lg shadow-md">
          <SelectGroup>
            <SelectLabel className="font-medium">Sorter etter</SelectLabel>
            {orderingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="h-9">
                <option.icon className="size-4.5" />
                <span className="text-sm font-medium">{option.label}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
