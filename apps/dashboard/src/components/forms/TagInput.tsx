import { ErrorMessage } from "@hookform/error-message"
import { TagsInput, type TagsInputProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createTagInput<F extends FieldValues>({
  ...props
}: Omit<TagsInputProps, "error">): InputProducerResult<F> {
  return function FormTagInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TagsInput
            {...props}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    )
  }
}
