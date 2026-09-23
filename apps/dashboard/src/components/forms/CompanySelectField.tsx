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
}: CompanySelectFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  const value = typeof field.value === "string" ? field.value : ""

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      fixedWidth={fixedWidth}
    >
      <CompanySelectInput
        id={id}
        value={value}
        onChange={field.onChange}
        placeholder={placeholder}
        disabled={combineFieldDisabled(field.disabled, disabled)}
        required={required}
        invalid={Boolean(error)}
        excludeCompanyIds={excludeCompanyIds}
      />
    </FieldShell>
  )
}
