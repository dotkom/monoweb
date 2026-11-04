"use client"

import { Button, InputGroup, InputGroupAddon, InputGroupInput } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import type { ComponentProps } from "react"

type ClearableSearchInputProps = Omit<ComponentProps<typeof InputGroupInput>, "value" | "onChange" | "defaultValue"> & {
  value: string
  onChange: (value: string) => void
  wrapperClassName?: string
}

export function ClearableSearchInput({ value, onChange, wrapperClassName, ...inputProps }: ClearableSearchInputProps) {
  const hasValue = Boolean(value)

  return (
    <InputGroup className={wrapperClassName}>
      <InputGroupInput
        {...inputProps}
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value)
        }}
      />
      {hasValue && !inputProps.disabled && (
        <InputGroupAddon align="inline-end">
          <Button type="button" variant="ghost" onClick={() => onChange("")}>
            <IconX />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
