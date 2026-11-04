"use client"

import type { TextInputProps } from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { ClearableSearchInput } from "./ClearableSearchInput"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type SearchFieldProps<TFieldValues extends FieldValues> = Omit<TextInputProps, "error" | "name" | "label"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  wrapperClassName?: string
  fixedWidth?: boolean
}

export function SearchField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  wrapperClassName,
  fixedWidth = false,
  ...inputProps
}: SearchFieldProps<TFieldValues>) {
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
      <ClearableSearchInput
        {...inputProps}
        id={id}
        name={field.name}
        ref={field.ref}
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        aria-invalid={error ? true : undefined}
        wrapperClassName={wrapperClassName}
        disabled={combineFieldDisabled(field.disabled, inputProps.disabled)}
      />
    </FieldShell>
  )
}
