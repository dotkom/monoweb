"use client"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, cn } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

export type SelectFieldOption = {
  value: string
  label: string
}

type SelectFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  options: SelectFieldOption[]
  disabled?: boolean
  className?: string
}

export function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  options,
  disabled,
  className,
}: SelectFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  const value = field.value !== null && field.value !== undefined ? String(field.value) : undefined

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <Select value={value} disabled={disabled} onValueChange={field.onChange} items={options}>
        <SelectTrigger id={id} className={cn("w-full", className)} aria-invalid={error ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldShell>
  )
}
