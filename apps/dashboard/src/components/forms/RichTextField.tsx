"use client"

import { RichTextInput, type RichTextInputProps } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type RichTextFieldProps<TFieldValues extends FieldValues> = Omit<RichTextInputProps, "value" | "onChange"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
}

export function RichTextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  ...richTextProps
}: RichTextFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)

  return (
    <FieldShell id={String(name)} label={label} description={description} required={required} error={error}>
      <RichTextInput value={field.value ?? ""} onChange={field.onChange} {...richTextProps} />
    </FieldShell>
  )
}
