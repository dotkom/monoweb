"use client"

import { DateTimePicker } from "@dotkomonline/ui"
import type { Control, FieldPathByValue, FieldValues } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type DateTimePickerFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPathByValue<TFieldValues, Date | null | undefined>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  withTime?: boolean
  className?: string
  minuteStep?: 5 | 10 | 15 | 30
  timeInputClassName?: string
}

export function DateTimePickerField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  withTime,
  className,
  minuteStep,
  timeInputClassName,
}: DateTimePickerFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <DateTimePicker
        value={field.value}
        onChange={field.onChange}
        placeholder={placeholder}
        withTime={withTime}
        className={className}
        minuteStep={minuteStep}
        timeInputClassName={timeInputClassName}
      />
    </FieldShell>
  )
}
