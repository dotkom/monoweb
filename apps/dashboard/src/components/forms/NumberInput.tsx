import { NumberInput, type NumberInputProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createNumberInput<F extends FieldValues, TTransformedValues extends FieldValues | undefined = F>({
  ...props
}: Omit<NumberInputProps, "error">): InputProducerResult<F, TTransformedValues> {
  return function FormNumberInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <NumberInput
            {...props}
            value={field.value}
            onChange={(value) => field.onChange({ target: { value } })}
            disabled={disabled ?? props.disabled}
            error={getErrorMessage(state, name)}
          />
        )}
      />
    )
  }
}
