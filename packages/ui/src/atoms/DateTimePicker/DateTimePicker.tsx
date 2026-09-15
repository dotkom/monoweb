import { formatDate, getHours, getMinutes, set, setHours, setMinutes } from "date-fns"
import { cn } from "../../utils"
import { Button } from "../Button/Button"
import { Calendar } from "../Calendar/Calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover"
import { TimeInput } from "../TimeInput/TimeInput"

interface DateTimePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  withTime?: boolean
  className?: string
  minuteStep?: 5 | 10 | 15 | 30
  timeInputClassName?: string
}

export const DateTimePicker = ({
  value,
  onChange,
  placeholder,
  withTime,
  className,
  minuteStep,
  timeInputClassName,
}: DateTimePickerProps) => {
  const defaultPlaceholder = withTime ? "Velg dato og tid" : "Velg dato"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("font-normal tabular-nums", className)}>
          {value !== null
            ? formatDate(value, withTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd")
            : (placeholder ?? defaultPlaceholder)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(next) => {
            if (!next) {
              onChange(null)
              return
            }

            onChange(value ? setHours(setMinutes(next, getMinutes(value)), getHours(value)) : next)
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

              onChange(set(value, { hours, minutes, seconds: 0, milliseconds: 0 }))
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
