"use client"

import { Checkbox, cn, Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, getFieldErrorMessage } from "./FieldShell"

type CheckboxFieldProps<TFieldValues extends FieldValues> = {
  fixedWidth?: boolean
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export function CheckboxField<TFieldValues extends FieldValues>({
  fixedWidth = false,
  control,
  name,
  label,
  description,
  disabled,
  onCheckedChange,
  className,
}: CheckboxFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <Field
      data-invalid={error !== undefined ? true : undefined}
      orientation="horizontal"
      className={cn(fixedWidth && "w-64 shrink-0", className)}
    >
      <Checkbox
        id={id}
        disabled={combineFieldDisabled(field.disabled, disabled)}
        checked={Boolean(field.value)}
        onCheckedChange={(checked) => {
          const next = checked === true
          field.onChange(next)
          onCheckedChange?.(next)
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
