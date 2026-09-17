"use client"

import type { TextInputProps } from "@dotkomonline/ui"
import { Input } from "@dotkomonline/ui/components/input"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type TextFieldProps<TFieldValues extends FieldValues> = Omit<TextInputProps, "error" | "name" | "label"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
}

export function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  ...inputProps
}: TextFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <Input
        id={id}
        name={field.name}
        ref={field.ref}
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        aria-invalid={error ? true : undefined}
        {...inputProps}
      />
    </FieldShell>
  )
}
