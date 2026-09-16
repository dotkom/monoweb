"use client"

import { Button, InputGroup, InputGroupAddon, InputGroupInput, type TextInputProps } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type SearchFieldProps<TFieldValues extends FieldValues> = Omit<TextInputProps, "error" | "name" | "label"> & {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  wrapperClassName?: string
}

export function SearchField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  wrapperClassName,
  ...inputProps
}: SearchFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = String(name)

  const hasValue = Boolean(field.value)

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <InputGroup className={wrapperClassName}>
        <InputGroupInput
          id={id}
          name={field.name}
          ref={field.ref}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          aria-invalid={error ? true : undefined}
          {...inputProps}
        />
        {hasValue && (
          <InputGroupAddon align="inline-end">
            <Button variant="ghost" type="reset" onClick={() => field.onChange("")}>
              <IconX />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>
    </FieldShell>
  )
}
