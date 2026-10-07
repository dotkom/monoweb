"use client"

import type { CompanyId } from "@dotkomonline/rpc/company"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { CompanySelectInput } from "./CompanySelectInput"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type CompanySelectFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  excludeCompanyIds?: CompanyId[]
  fixedWidth?: boolean
  multiple?: boolean
}

export function CompanySelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  disabled,
  excludeCompanyIds,
  fixedWidth = false,
  multiple = false,
}: CompanySelectFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  let Input = null

  if (multiple) {
    const value = Array.isArray(field.value) ? field.value : []

    Input = (
      <CompanySelectInput
        multiple
        id={id}
        value={value}
        onChange={field.onChange}
        placeholder={placeholder}
        disabled={combineFieldDisabled(field.disabled, disabled)}
        required={required}
        invalid={Boolean(error)}
        excludeCompanyIds={excludeCompanyIds}
      />
    )
  } else {
    const value = typeof field.value === "string" ? field.value : ""

    Input = (
      <CompanySelectInput
        id={id}
        value={value}
        onChange={field.onChange}
        placeholder={placeholder}
        disabled={combineFieldDisabled(field.disabled, disabled)}
        required={required}
        invalid={Boolean(error)}
        excludeCompanyIds={excludeCompanyIds}
        multiple={multiple}
      />
    )
  }

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      fixedWidth={fixedWidth}
    >
      {Input}
    </FieldShell>
  )
}
