import { TextInput, type TextInputProps } from "@mantine/core"
import type { FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createTextInput<F extends FieldValues>({
  ...props
}: Omit<TextInputProps, "error">): InputProducerResult<F> {
  return function FormTextInput({ name, state, register }) {
    return <TextInput {...register(name)} {...props} error={getErrorMessage(state, name)} />
  }
}
