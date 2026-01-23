import { getCurrentUTC } from "@dotkomonline/utils"
import { ErrorMessage } from "@hookform/error-message"
import { DatePickerInput, type DatePickerInputProps } from "@mantine/dates"
import { roundToNearestHours } from "date-fns"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"
import { ActionIcon, Stack } from "@mantine/core"
import { IconX } from "@tabler/icons-react"

export function createDateInput<F extends FieldValues>({
  ...props
}: Omit<DatePickerInputProps, "error">): InputProducerResult<F> {
  return function FormDateInput({ name, state, control, defaultValue }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Stack gap="0.25rem">
            <DatePickerInput
              {...props}
              valueFormat="YYYY-MM-DD"
              style={{ flexGrow: 1, ...props.style }}
              defaultValue={defaultValue ?? roundToNearestHours(getCurrentUTC(), { roundingMethod: "ceil" })}
              value={field.value}
              onChange={field.onChange}
              error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
              rightSection={
                props.required !== true && (
                  <ActionIcon w="fit-content" color="gray" variant="subtle" onClick={() => field.onChange(null)}>
                    <IconX size="0.85rem" />
                  </ActionIcon>
                )
              }
            />
          </Stack>
        )}
      />
    )
  }
}
