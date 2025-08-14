import { getCurrentUTC } from "@dotkomonline/utils"
import { ErrorMessage } from "@hookform/error-message"
import { DateTimePicker, type DateTimePickerProps } from "@mantine/dates"
import { roundToNearestHours } from "date-fns"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createDateTimeInput<F extends FieldValues>({
  ...props
}: Omit<DateTimePickerProps, "error">): InputProducerResult<F> {
  return function FormDateTimeInput({ name, state, control, defaultValue }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DateTimePicker
            {...props}
            defaultValue={defaultValue ?? roundToNearestHours(getCurrentUTC(), { roundingMethod: "ceil" })}
            value={field.value}
            onChange={field.onChange}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
          />
        )}
      />
    )
  }
}
