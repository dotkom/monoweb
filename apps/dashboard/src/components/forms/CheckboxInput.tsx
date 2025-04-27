import { ErrorMessage } from "@hookform/error-message"
import { Checkbox, type CheckboxProps } from "@mantine/core"
import type { FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createCheckboxInput<F extends FieldValues>({
  ...props
}: Omit<CheckboxProps, "error">): InputProducerResult<F> {
  return function FormCheckboxInput({ name, state, register }) {
    return (
      <Checkbox
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
      />
    )
  }
}
