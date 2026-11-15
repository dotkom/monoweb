"use client"

import {
  addMilliseconds,
  differenceInMilliseconds,
  formatDate,
  getHours,
  getMinutes,
  set,
  setHours,
  setMinutes,
} from "date-fns"
import { useRef } from "react"
import { IconX } from "@tabler/icons-react"
import { cn } from "../../utils"
import { Button } from "../Button/Button"
import { Calendar } from "../Calendar/Calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover"
import { TimeInput } from "../TimeInput/TimeInput"

export type DateTimePickerSyncOffsetTo = {
  getLinkedValue: () => Date | null
  onLinkedValueChange: (date: Date) => void
}

interface DateTimePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  withTime?: boolean
  className?: string
  minuteStep?: 5 | 10 | 15 | 30 | 60
  timeInputClassName?: string
  disabled?: boolean
  clearable?: boolean
  syncOffsetTo?: DateTimePickerSyncOffsetTo
}

export const DateTimePicker = ({
  value,
  onChange,
  placeholder,
  withTime,
  className,
  minuteStep,
  timeInputClassName,
  disabled,
  clearable = false,
  syncOffsetTo,
}: DateTimePickerProps) => {
  const defaultPlaceholder = withTime ? "Velg dato og tid" : "Velg dato"
  const previousValueRef = useRef<Date | null>(value)

  const handleChange = (nextDate: Date | null) => {
    const previousDate = previousValueRef.current

    if (syncOffsetTo && previousDate !== null && nextDate !== null) {
      const linkedFieldValue = syncOffsetTo.getLinkedValue()

      if (linkedFieldValue !== null) {
        const deltaMilliseconds = differenceInMilliseconds(nextDate, previousDate)

        syncOffsetTo.onLinkedValueChange(addMilliseconds(linkedFieldValue, deltaMilliseconds))
      }
    }

    previousValueRef.current = nextDate
    onChange(nextDate)
  }

  return (
    <Popover>
      <div className="relative inline-flex">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start font-normal tabular-nums enabled:active:scale-100",
              clearable && value !== null && "pr-10",
              className
            )}
          >
            {value !== null
              ? formatDate(value, withTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd")
              : (placeholder ?? defaultPlaceholder)}
          </Button>
        </PopoverTrigger>
        {clearable && value !== null && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            aria-label="Fjern dato"
            disabled={disabled}
            onClick={() => handleChange(null)}
          >
            <IconX className="size-4" />
          </Button>
        )}
      </div>
      <PopoverContent className="w-fit" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(next) => {
            if (!next) {
              handleChange(null)
              return
            }

            handleChange(value ? setHours(setMinutes(next, getMinutes(value)), getHours(value)) : next)
          }}
        />

        {withTime && (
          <TimeInput
            value={value ? { hours: getHours(value), minutes: getMinutes(value) } : null}
            disabled={!value}
            className={timeInputClassName}
            minuteStep={minuteStep}
            onChange={({ hours, minutes }) => {
              if (!value) {
                return
              }

              handleChange(set(value, { hours, minutes, seconds: 0, milliseconds: 0 }))
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
