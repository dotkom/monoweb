import { format, setHours, setMinutes } from "date-fns"
import type { ComponentPropsWithRef } from "react"
import { cn } from "../../utils"
import { Button } from "../Button/Button"
import { TextInput } from "../Input/TextInput"
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover"

export type TimeInputProps = Omit<ComponentPropsWithRef<"input">, "step" | "value" | "onChange"> & {
  value: { hours: number; minutes: number } | null
  onChange: (value: { hours: number; minutes: number }) => void
  minuteStep?: 5 | 10 | 15 | 30
  disabled?: boolean
  className?: string
}

export const TimeInput = ({ value, onChange, minuteStep, className, disabled }: TimeInputProps) => {
  const hours = Array.from({ length: 24 }, (_, index) => index)
  const allMinutesInDay = Array.from({ length: 60 }, (_, index) => index)
  const minutes = minuteStep ? allMinutesInDay.filter((minute) => minute % minuteStep === 0) : allMinutesInDay

  const label = value ? `${String(value.hours).padStart(2, "0")}:${String(value.minutes).padStart(2, "0")}` : ""

  return (
    <Popover>
      <PopoverTrigger>
        <TextInput
          type="time"
          disabled={disabled}
          value={label}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(":").map(Number)
            if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
              return
            }

            onChange({ hours, minutes })
          }}
          className={cn("tabular-nums font-normal text-sm [&::-webkit-calendar-picker-indicator]:hidden", className)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-fit" initialFocus={false}>
        <div className="flex h-64 gap-2">
          <TimeInputList
            value={value?.hours}
            onChange={(hours) => onChange({ hours, minutes: value?.minutes ?? 0 })}
            items={hours}
            formatItemLabel={(hour) => format(setHours(new Date(), hour), "HH")}
          />
          <TimeInputList
            value={value?.minutes}
            onChange={(minutes) => onChange({ hours: value?.hours ?? 0, minutes })}
            items={minutes}
            formatItemLabel={(minute) => format(setMinutes(new Date(), minute), "mm")}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TimeInputListProps {
  value?: number
  onChange: (value: number) => void
  items: number[]
  formatItemLabel: (item: number) => string
}

const TimeInputList = ({ value, onChange, items, formatItemLabel }: TimeInputListProps) => {
  return (
    <div className="max-h-full w-20 overflow-y-auto">
      {items.map((item) => {
        const isSelected = item === value

        return (
          <Button
            key={item}
            className={cn(
              "w-full font-normal text-sm",
              isSelected &&
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/90 dark:hover:text-primary-foreground"
            )}
            aria-selected={isSelected}
            onClick={() => onChange(item)}
            variant="ghost"
          >
            {formatItemLabel(item)}
          </Button>
        )
      })}
    </div>
  )
}
