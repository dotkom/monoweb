"use client"

import { DateTimePicker } from "@dotkomonline/ui"
import type { Control, FieldPathByValue, FieldValues, PathValue } from "react-hook-form"
import { useController, useFormContext } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type DateTimePickerFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPathByValue<TFieldValues, Date | null | undefined>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  withTime?: boolean
  className?: string
  minuteStep?: 5 | 10 | 15 | 30 | 60
  timeInputClassName?: string
  fixedWidth?: boolean
  syncOffsetTo?: FieldPathByValue<TFieldValues, Date | null | undefined>
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
  fixedWidth = false,
  syncOffsetTo,
}: DateTimePickerFieldProps<TFieldValues>) {
  const { setValue, getValues } = useFormContext<TFieldValues>()
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      fixedWidth={fixedWidth}
    >
      <DateTimePicker
        value={field.value ?? null}
        onChange={field.onChange}
        placeholder={placeholder}
        withTime={withTime}
        className={className}
        minuteStep={minuteStep}
        timeInputClassName={timeInputClassName}
        disabled={combineFieldDisabled(field.disabled)}
        syncOffsetTo={
          syncOffsetTo
            ? {
                getLinkedValue: () => toDate(getValues(syncOffsetTo)),
                onLinkedValueChange: (date) => {
                  setValue(syncOffsetTo, date as PathValue<TFieldValues, typeof syncOffsetTo>, {
                    shouldDirty: true,
                  })
                },
              }
            : undefined
        }
      />
    </FieldShell>
  )
}

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  const parsed = new Date(String(value))

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}
