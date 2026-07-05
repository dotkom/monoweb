import { getCurrentUTC } from "@dotkomonline/utils"
import { DateTimePicker, type DateTimePickerProps } from "@mantine/dates"
import { roundToNearestHours } from "date-fns"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"
import { IconX } from "@tabler/icons-react"
import { ActionIcon } from "@mantine/core"

export function createDateTimeInput<F extends FieldValues>({
  ...props
}: Omit<DateTimePickerProps, "error">): InputProducerResult<F> {
  return function FormDateTimeInput({ name, state, control, defaultValue, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DateTimePicker
            {...props}
            valueFormat="YYYY-MM-DD HH:mm"
            locale="nb"
            style={{ flexGrow: 1, ...props.style }}
            defaultValue={defaultValue ?? roundToNearestHours(getCurrentUTC(), { roundingMethod: "ceil" })}
            value={field.value}
            onChange={field.onChange}
            disabled={disabled ?? props.disabled}
            error={getErrorMessage(state, name)}
            rightSection={
              props.required !== true && (
                <ActionIcon
                  w="fit-content"
                  color="gray"
                  variant="subtle"
                  disabled={disabled ?? props.disabled}
                  onClick={() => field.onChange(null)}
                >
                  <IconX size="0.85rem" />
                </ActionIcon>
              )
            }
          />
        )}
      />
    )
  }
}
