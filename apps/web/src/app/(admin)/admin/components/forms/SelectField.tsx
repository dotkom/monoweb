"use client"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, cn } from "@dotkomonline/ui"
import type { Control, FieldPathByValue, FieldValues } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

export type SelectFieldOption<TValue extends string | number | boolean = string> = {
  value: TValue
  label: string
}

type SelectFieldProps<TFieldValues extends FieldValues, TValue extends string | number | boolean> = {
  control: Control<TFieldValues>
  name: FieldPathByValue<TFieldValues, TValue | null | undefined>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  options: readonly SelectFieldOption<TValue>[]
  disabled?: boolean
  className?: string
  fixedWidth?: boolean
}

export function SelectField<TFieldValues extends FieldValues, TValue extends string | number | boolean>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  options,
  disabled,
  className,
  fixedWidth = false,
}: SelectFieldProps<TFieldValues, TValue>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)
  const canClear = !required

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      fixedWidth={fixedWidth}
    >
      <Select
        value={field.value ?? null}
        disabled={combineFieldDisabled(field.disabled, disabled)}
        onValueChange={(next, eventDetails) => {
          if (canClear && Object.is(next, field.value)) {
            eventDetails.cancel()
            field.onChange(null)
            return
          }

          field.onChange(next)
        }}
        items={options}
      >
        <SelectTrigger id={id} className={cn("w-full", className)} aria-invalid={error ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={String(option.value)} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldShell>
  )
}
