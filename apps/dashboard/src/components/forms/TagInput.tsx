import { TagsInput, type TagsInputProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createTagInput<F extends FieldValues>({
  ...props
}: Omit<TagsInputProps, "error">): InputProducerResult<F> {
  return function FormTagInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TagsInput {...props} error={getErrorMessage(state, name)} onChange={field.onChange} value={field.value} />
        )}
      />
    )
  }
}
