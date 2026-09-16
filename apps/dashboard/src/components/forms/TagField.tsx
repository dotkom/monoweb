"use client"

import { TagInput, type TagInputProps } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type TagFieldProps<TFieldValues extends FieldValues> = Omit<TagInputProps, "error" | "name" | "value" | "onChange"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  fixedWidth?: boolean
}

export function TagField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  fixedWidth = false,
  ...inputProps
}: TagFieldProps<TFieldValues>) {
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
      <TagInput
        id={id}
        value={field.value ?? []}
        onChange={field.onChange}
        aria-invalid={error ? true : undefined}
        {...inputProps}
        disabled={combineFieldDisabled(field.disabled, inputProps.disabled)}
      />
    </FieldShell>
  )
}
