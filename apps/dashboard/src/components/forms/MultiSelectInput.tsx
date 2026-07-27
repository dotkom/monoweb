import { MultiSelect, type MultiSelectProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createMultipleSelectInput<
  F extends FieldValues,
  TTransformedValues extends FieldValues | undefined = F,
>({ ...props }: Omit<MultiSelectProps, "error">): InputProducerResult<F, TTransformedValues> {
  return function FormMultiSelectInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <MultiSelect
            {...props}
            error={getErrorMessage(state, name)}
            onChange={field.onChange}
            value={field.value}
            disabled={disabled ?? props.disabled}
          />
        )}
      />
    )
  }
}
