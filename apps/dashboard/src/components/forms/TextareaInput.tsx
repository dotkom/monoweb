import { Textarea, type TextareaProps } from "@mantine/core"
import type { FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createTextareaInput<F extends FieldValues, TTransformedValues extends FieldValues | undefined = F>({
  ...props
}: Omit<TextareaProps, "error">): InputProducerResult<F, TTransformedValues> {
  return function TextareaInput({ name, state, register, disabled }) {
    return (
      <Textarea
        {...register(name)}
        {...props}
        disabled={disabled ?? props.disabled}
        error={getErrorMessage(state, name)}
      />
    )
  }
}
