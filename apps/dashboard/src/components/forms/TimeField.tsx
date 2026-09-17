"use client"

import { TimeInput, type TimeInputProps } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type TimeFieldProps<TFieldValues extends FieldValues> = Omit<TimeInputProps, "value" | "onChange"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
}

export function TimeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  ...timeInputProps
}: TimeFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <TimeInput value={field.value ?? null} onChange={field.onChange} {...timeInputProps} />
    </FieldShell>
  )
}
