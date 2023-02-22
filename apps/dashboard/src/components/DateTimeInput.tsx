import { ComponentProps, forwardRef, RefObject, useCallback, useState } from "react"
import { Group } from "@mantine/core"
import { DatePicker, TimeInput } from "@mantine/dates"

export type DateTimeInputProps = {
  dateRef?: RefObject<HTMLInputElement>
  timeRef?: RefObject<HTMLInputElement>
  value?: Date
  onChange?: (date: Date) => void
  label: string
  withAsterisk?: boolean
} & ComponentProps<typeof DatePicker>

export const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(function DateTimeInputComponent(
  { dateRef, timeRef, label, value, onChange, withAsterisk, ...props },
  ref
) {
  const [date, setDate] = useState(() => {
    if (value) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate())
    }
    return new Date()
  })
  const [time, setTime] = useState(() => {
    const now = new Date()
    if (value) {
      now.setHours(value.getHours())
      now.setMinutes(value.getMinutes())
    }
    return now
  })
  const getCompositeDateTime = useCallback(() => {
    const clone = new Date(date)
    clone.setHours(time.getHours())
    clone.setMinutes(time.getMinutes())
    return clone
  }, [date, time])
  const onDateChange = (newDate: Date) => {
    setDate(newDate)
    onChange?.(getCompositeDateTime())
  }
  const onTimeChange = (newTime: Date) => {
    setTime(newTime)
    onChange?.(getCompositeDateTime())
  }

  return (
    <div ref={ref}>
      <Group>
        <DatePicker
          label={label}
          ref={dateRef}
          withAsterisk={withAsterisk}
          id="date"
          value={date}
          onChange={onDateChange}
          {...props}
        />
        <TimeInput ref={timeRef} label="&nbsp;" value={time} onChange={onTimeChange} />
      </Group>
    </div>
  )
})
