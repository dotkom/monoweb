import { ErrorMessage, FieldValuesFromFieldErrors } from "@hookform/error-message"
import { Textarea, type TextareaProps } from "@mantine/core"
import type { FieldErrors, FieldName, FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createTextareaInput<F extends FieldValues>({
  ...props
}: Omit<TextareaProps, "error">): InputProducerResult<F> {
  return function TextareaInput({ name, state, register }) {
    return (
      <Textarea
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name as unknown as FieldName<FieldValuesFromFieldErrors<FieldErrors<F>>>} />}
      />
    )
  }
}
