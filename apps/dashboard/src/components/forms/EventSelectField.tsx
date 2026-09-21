"use client"

import type { EventId } from "@dotkomonline/rpc/event"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { EventSelectInput } from "./new-form/EventSelectInput"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type EventSelectFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  excludeChildEvents?: boolean
  excludeEventIds?: EventId[]
  fixedWidth?: boolean
}

export function EventSelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  disabled,
  excludeChildEvents = false,
  excludeEventIds,
  fixedWidth = false,
}: EventSelectFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  const value = typeof field.value === "string" ? field.value : ""

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      fixedWidth={fixedWidth}
    >
      <EventSelectInput
        id={id}
        value={value}
        onChange={field.onChange}
        placeholder={placeholder}
        disabled={combineFieldDisabled(field.disabled, disabled)}
        required={required}
        invalid={Boolean(error)}
        excludeChildEvents={excludeChildEvents}
        excludeEventIds={excludeEventIds}
      />
    </FieldShell>
  )
}
