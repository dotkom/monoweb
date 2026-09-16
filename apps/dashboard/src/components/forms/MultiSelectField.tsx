"use client"

import { TagInput } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"
import type { SelectFieldOption } from "./SelectField"

type MultiSelectFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  options: SelectFieldOption[]
  disabled?: boolean
  className?: string
  creatable?: boolean
  fixedWidth?: boolean
}

export function MultiSelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  options,
  disabled,
  className,
  creatable = false,
  fixedWidth = false,
}: MultiSelectFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  const valueToLabel = new Map(options.map((option) => [option.value, option.label]))
  const labelToValue = new Map(options.map((option) => [option.label, option.value]))

  const selectedLabels = (Array.isArray(field.value) ? field.value : []).map(
    (stored: string) => valueToLabel.get(stored) ?? stored
  )

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      fixedWidth={fixedWidth}
    >
      <TagInput
        id={id}
        disabled={combineFieldDisabled(field.disabled, disabled)}
        className={className}
        placeholder={placeholder}
        creatable={creatable}
        data={options.map((option) => option.label)}
        value={selectedLabels}
        onChange={(labels) => {
          const nextValues = creatable
            ? labels.map((item) => labelToValue.get(item) ?? item)
            : labels.flatMap((item) => {
                const value = labelToValue.get(item)
                return value === undefined ? [] : [value]
              })
          field.onChange(nextValues)
        }}
      />
    </FieldShell>
  )
}
