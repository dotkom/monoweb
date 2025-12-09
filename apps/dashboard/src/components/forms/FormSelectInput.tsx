import { ErrorMessage } from "@hookform/error-message"
import { Select, type SelectProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createIntegerSelectInput<F extends FieldValues>({
  ...props
}: Omit<SelectProps, "data" | "error"> & {
  data: { value: number; label: string }[]
}): InputProducerResult<F> {
  return function FormSelectInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...props}
            data={props.data.map((item) => ({
              ...item,
              value: item.value.toString(),
            }))}
            value={field.value?.toString() ?? ""}
            onChange={(value) => field.onChange(value !== null ? Number.parseInt(value, 10) : null)}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
          />
        )}
      />
    )
  }
}
