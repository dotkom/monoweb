import { FC, useRef } from "react"
import { useDateFieldState } from "@react-stately/datepicker"
import { createCalendar } from "@internationalized/date"
import { useDateField } from "@react-aria/datepicker"
import { DateSegment } from "./DateSegment"

export type DateFieldProps = {}

export const DateField: FC<DateFieldProps> = ({ ...props }) => {
  const ref = useRef<HTMLDivElement>(null)
  const state = useDateFieldState({
    ...props,
    locale: "no-NB",
    createCalendar,
  })
  const { fieldProps } = useDateField(props, state, ref)

  return (
    <div {...fieldProps} ref={ref} className="flex">
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  )
}
