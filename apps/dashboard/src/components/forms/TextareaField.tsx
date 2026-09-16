"use client"

import type { ComponentProps } from "react"
import { Textarea } from "@dotkomonline/ui/components/textarea"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type TextareaFieldProps<TFieldValues extends FieldValues> = Omit<ComponentProps<typeof Textarea>, "id"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
}

export function TextareaField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  ...textareaProps
}: TextareaFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <Textarea
        id={id}
        name={field.name}
        ref={field.ref}
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        aria-invalid={error ? true : undefined}
        {...textareaProps}
      />
    </FieldShell>
  )
}
