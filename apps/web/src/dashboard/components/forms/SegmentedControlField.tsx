"use client"

import { ToggleGroup, ToggleGroupItem, cn } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"
import type { SelectFieldOption } from "./SelectField"

type SegmentedControlFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  options: SelectFieldOption[]
  disabled?: boolean
  className?: string
  fullWidth?: boolean
  fixedWidth?: boolean
}

export function SegmentedControlField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  options,
  disabled,
  className,
  fullWidth = false,
  fixedWidth = false,
}: SegmentedControlFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  const selectedValue = field.value !== null && field.value !== undefined ? String(field.value) : ""

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      fixedWidth={fixedWidth}
    >
      <ToggleGroup
        className={cn(fullWidth && "w-full", className)}
        spacing={0}
        multiple={false}
        disabled={combineFieldDisabled(field.disabled, disabled)}
        value={selectedValue ? [selectedValue] : []}
        onValueChange={(next) => {
          const value = next.at(0)
          if (value !== undefined) {
            field.onChange(value)
            return
          }

          if (!required) {
            field.onChange(null)
          }
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={cn(fullWidth && "flex-1")}
            aria-label={option.label}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FieldShell>
  )
}
