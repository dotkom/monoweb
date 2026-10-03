"use client"

import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@dotkomonline/ui"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { RequiredMark } from "../RequiredMark"
import { combineFieldDisabled, getFieldErrorMessage } from "./FieldShell"

export type CheckboxGroupFieldOption<T extends string | number = string | number> = {
  value: T
  label: string
  disabled?: boolean
}

type CheckboxGroupFieldProps<TFieldValues extends FieldValues, TOption extends string | number = string | number> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  options: CheckboxGroupFieldOption<TOption>[]
}

export function CheckboxGroupField<
  TFieldValues extends FieldValues,
  TOption extends string | number = string | number,
>({ control, name, label, description, required, options }: CheckboxGroupFieldProps<TFieldValues, TOption>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const fieldName = String(name)

  const selected: TOption[] = Array.isArray(field.value) ? field.value : []

  const toggleValue = (value: TOption) => {
    if (selected.includes(value)) {
      field.onChange(selected.filter((item) => item !== value))
    } else {
      field.onChange([...selected, value])
    }
  }

  return (
    <FieldSet>
      {label && (
        <FieldLegend variant="label">
          {label}
          {required && <RequiredMark />}
        </FieldLegend>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}

      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const optionId = `${fieldName}-${String(option.value)}`
          const checked = selected.includes(option.value)

          return (
            <Field key={String(option.value)} orientation="horizontal">
              <Checkbox
                id={optionId}
                disabled={combineFieldDisabled(field.disabled, option.disabled)}
                checked={checked}
                onCheckedChange={() => {
                  toggleValue(option.value)
                }}
              />
              <FieldContent>
                <FieldLabel htmlFor={optionId}>{option.label}</FieldLabel>
              </FieldContent>
            </Field>
          )
        })}
      </div>

      <FieldError>{error}</FieldError>
    </FieldSet>
  )
}
