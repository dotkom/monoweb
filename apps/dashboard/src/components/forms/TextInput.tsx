import { TextInput, type TextInputProps } from "@mantine/core"
import type { FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createTextInput<F extends FieldValues>({
  ...props
}: Omit<TextInputProps, "error">): InputProducerResult<F> {
  return function FormTextInput({ name, state, register, disabled }) {
    return (
      <TextInput
        {...register(name)}
        {...props}
        disabled={disabled ?? props.disabled}
        error={getErrorMessage(state, name)}
      />
    )
  }
}
