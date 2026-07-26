import { getCurrentUTC } from "@dotkomonline/utils"
import { ActionIcon } from "@mantine/core"
import { DateTimePicker, type DateTimePickerProps } from "@mantine/dates"
import { IconX } from "@tabler/icons-react"
import { addMilliseconds, differenceInMilliseconds, roundToNearestHours } from "date-fns"
import { useRef } from "react"
import { Controller, type FieldPath, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

export function createDateTimeInput<FieldValue extends FieldValues>({
  syncOffsetTo,
  ...props
}: Omit<DateTimePickerProps, "error"> & {
  syncOffsetTo?: FieldPath<FieldValue>
}): InputProducerResult<FieldValue> {
  return function FormDateTimeInput({ name, state, control, defaultValue, disabled, setValue, getValues }) {
    const previousValueRef = useRef(toDate(getValues(name) ?? defaultValue))

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
            onChange={(nextValue) => {
              const nextDate = toDate(nextValue)
              const previousDate = previousValueRef.current

              // If the linked field is set, we add the offset delta to the linked field value
              if (syncOffsetTo && previousDate !== null && nextDate !== null) {
                const linkedFieldValue = toDate(getValues(syncOffsetTo))

                if (linkedFieldValue !== null) {
                  const deltaMilliseconds = differenceInMilliseconds(nextDate, previousDate)

                  setValue(syncOffsetTo, addMilliseconds(linkedFieldValue, deltaMilliseconds), { shouldDirty: true })
                }
              }

              previousValueRef.current = nextDate
              field.onChange(nextValue)
            }}
            disabled={disabled ?? props.disabled}
            error={getErrorMessage(state, name)}
            rightSection={
              props.required !== true && (
                <ActionIcon
                  w="fit-content"
                  color="gray"
                  variant="subtle"
                  disabled={disabled ?? props.disabled}
                  onClick={() => {
                    previousValueRef.current = null
                    field.onChange(null)
                  }}
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

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  const parsed = new Date(String(value))

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}
