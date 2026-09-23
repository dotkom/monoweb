"use client"

import type { TextInputProps } from "@dotkomonline/ui"
import { Input } from "@dotkomonline/ui/components/input"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type TextFieldProps<TFieldValues extends FieldValues> = Omit<TextInputProps, "error" | "name" | "label"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  fixedWidth?: boolean
}

export function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  fixedWidth = false,
  ...inputProps
}: TextFieldProps<TFieldValues>) {
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
      <Input
        id={id}
        name={field.name}
        ref={field.ref}
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        aria-invalid={error ? true : undefined}
        {...inputProps}
        disabled={combineFieldDisabled(field.disabled, inputProps.disabled)}
      />
    </FieldShell>
  )
}
