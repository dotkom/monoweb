import { Checkbox, type CheckboxProps } from "@mantine/core"
import type { FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createCheckboxInput<F extends FieldValues>({
  ...props
}: Omit<CheckboxProps, "error">): InputProducerResult<F> {
  return function FormCheckboxInput({ name, state, register, disabled }) {
    return (
      <Checkbox
        {...register(name)}
        {...props}
        disabled={disabled ?? props.disabled}
        error={getErrorMessage(state, name)}
      />
    )
  }
}
