import { FC, useRef } from "react"
import { useTimeFieldState } from "@react-stately/datepicker"
import { useTimeField } from "@react-aria/datepicker"
import { Label } from "@radix-ui/react-label"
import { DateSegment } from "./DateSegment"

export type TimeFieldProps = {
  label: string
}

export const TimeField: FC<TimeFieldProps> = ({ label, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)
  const state = useTimeFieldState({
    ...props,
    locale: "no-NB",
  })

  const { labelProps, fieldProps } = useTimeField(props, state, ref)

  return (
    <div>
      <Label {...labelProps}>{label}</Label>
      <div {...fieldProps} ref={ref}>
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}
      </div>
    </div>
  )
}
