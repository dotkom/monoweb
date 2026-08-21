import { EventSelect } from "@/app/(internal)/arrangementer/components/event-select"
import type { EventId } from "@dotkomonline/rpc/event"
import type { SelectProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "./types"

interface Props extends Omit<SelectProps, "error"> {
  excludeChildEvents?: boolean
  excludeEventIds?: EventId[]
}

export function createEventSelectInput<F extends FieldValues, TTransformedValues extends FieldValues | undefined = F>({
  excludeChildEvents = false,
  excludeEventIds,
  ...props
}: Props): InputProducerResult<F, TTransformedValues> {
  return function FormSelectInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <EventSelect
            {...props}
            value={field.value}
            onChange={field.onChange}
            disabled={disabled ?? props.disabled}
            error={getErrorMessage(state, name)}
            excludeChildEvents={excludeChildEvents}
            excludeEventIds={excludeEventIds}
          />
        )}
      />
    )
  }
}
