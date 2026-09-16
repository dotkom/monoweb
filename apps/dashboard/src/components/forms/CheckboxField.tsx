"use client"

import { Checkbox, Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { getFieldErrorMessage } from "./FieldShell"

type CheckboxFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  disabled?: boolean
}

export function CheckboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: CheckboxFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <Field data-invalid={error !== undefined ? true : undefined} orientation="horizontal">
      <Checkbox
        id={id}
        disabled={disabled}
        checked={Boolean(field.value)}
        onCheckedChange={(checked) => {
          field.onChange(checked === true)
        }}
        onBlur={field.onBlur}
        name={field.name}
        aria-invalid={error ? true : undefined}
      />
      {(label || description) && (
        <FieldContent>
          {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      )}
      <FieldError>{error}</FieldError>
    </Field>
  )
}
