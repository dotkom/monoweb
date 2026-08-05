import { Input, SegmentedControl, type SegmentedControlProps } from "@mantine/core"
import type { ReactNode } from "react"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

type SegmentedControlInputProps = Omit<SegmentedControlProps, "error" | "value" | "onChange"> & {
  label?: ReactNode
  description?: ReactNode
  withAsterisk?: boolean
  required?: boolean
}

export function createSegmentedControlInput<
  F extends FieldValues,
  TTransformedValues extends FieldValues | undefined = F,
>({
  label,
  description,
  withAsterisk,
  required,
  fullWidth = false,
  ...props
}: SegmentedControlInputProps): InputProducerResult<F, TTransformedValues> {
  return function FormSegmentedControlInput({ name, state, control, disabled }) {
    return (
      <Input.Wrapper
        label={label}
        description={description}
        withAsterisk={withAsterisk}
        required={required}
        error={getErrorMessage(state, name)}
      >
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <SegmentedControl
              {...props}
              fullWidth={fullWidth}
              mt={label || description ? "xs" : undefined}
              value={field.value}
              onChange={field.onChange}
              disabled={disabled ?? props.disabled}
            />
          )}
        />
      </Input.Wrapper>
    )
  }
}
