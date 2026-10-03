"use client"

import { FileInput, type FileInputProps } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type FileFieldProps<TFieldValues extends FieldValues> = Omit<
  FileInputProps,
  "label" | "description" | "error" | "value" | "onChange"
> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
}

export function FileField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  onFileUpload,
  ...fileInputProps
}: FileFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <FileInput
        value={field.value}
        onChange={field.onChange}
        onFileUpload={onFileUpload}
        required={required}
        {...fileInputProps}
        disabled={combineFieldDisabled(field.disabled, fileInputProps.disabled)}
      />
    </FieldShell>
  )
}
