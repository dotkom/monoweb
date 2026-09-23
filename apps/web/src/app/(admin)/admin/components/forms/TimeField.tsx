"use client"

import { TimeInput, type TimeInputProps } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type TimeFieldProps<TFieldValues extends FieldValues> = Omit<TimeInputProps, "value" | "onChange"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  fixedWidth?: boolean
  valueAs?: "time" | "minutes"
}

export function TimeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  fixedWidth = false,
  valueAs = "time",
  ...timeInputProps
}: TimeFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)
  const isMinutes = valueAs === "minutes"

  const value = isMinutes
    ? typeof field.value === "number"
      ? { hours: Math.floor(field.value / 60), minutes: field.value % 60 }
      : null
    : (field.value ?? null)

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      fixedWidth={fixedWidth}
    >
      <TimeInput
        value={value}
        onChange={(next) => field.onChange(isMinutes ? next.hours * 60 + next.minutes : next)}
        {...timeInputProps}
        disabled={combineFieldDisabled(field.disabled, timeInputProps.disabled)}
      />
    </FieldShell>
  )
}
