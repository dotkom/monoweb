"use client"

import { TagInput, type TagInputProps } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type TagFieldProps<TFieldValues extends FieldValues> = Omit<TagInputProps, "error" | "name" | "value" | "onChange"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
}

export function TagField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  ...inputProps
}: TagFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <TagInput
        id={id}
        value={field.value ?? []}
        onChange={field.onChange}
        aria-invalid={error ? true : undefined}
        {...inputProps}
      />
    </FieldShell>
  )
}
