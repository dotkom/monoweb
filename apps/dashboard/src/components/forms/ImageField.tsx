"use client"

import { ImageInput, type ImageInputProps } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type ImageFieldProps<TFieldValues extends FieldValues> = Omit<
  ImageInputProps,
  "label" | "description" | "error" | "value" | "onChange"
> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
}

export function ImageField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  onFileUpload,
  ...imageInputProps
}: ImageFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <ImageInput value={field.value} onChange={field.onChange} onFileUpload={onFileUpload} {...imageInputProps} />
    </FieldShell>
  )
}
