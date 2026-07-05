import { Select, type SelectProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createSelectInput<F extends FieldValues>({
  ...props
}: Omit<SelectProps, "error">): InputProducerResult<F> {
  return function FormSelectInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...props}
            value={field.value}
            onChange={field.onChange}
            disabled={disabled ?? props.disabled}
            error={getErrorMessage(state, name)}
          />
        )}
      />
    )
  }
}
