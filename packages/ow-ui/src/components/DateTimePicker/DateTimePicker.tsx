import { FC, useId, useRef } from "react"
import { Label } from "@radix-ui/react-label"
import { useDatePicker } from "@react-aria/datepicker"
import { useDatePickerState } from "@react-stately/datepicker"
import { DateField } from "./DateField"
import { Icon } from "@iconify-icon/react"
import { CalendarPopover } from "./CalendarPopover"

export type DateTimePickerProps = {
  label: string
} & Parameters<typeof useDatePicker>[0]

export const DateTimePicker: FC<DateTimePickerProps> = ({ label, ...props }) => {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const state = useDatePickerState(props)
  const { groupProps, labelProps, fieldProps, buttonProps, dialogProps, calendarProps } = useDatePicker(
    props,
    state,
    ref
  )

  return (
    <div className="relative inline-flex flex-col">
      <Label {...labelProps} id={id}>
        {label}
      </Label>
      <div {...groupProps} ref={ref} className="inline-flex w-auto">
        <DateField {...fieldProps} />
        <button {...buttonProps} ref={triggerRef}>
          <Icon icon="material-symbols:calendar-month-outline-sharp" />
        </button>
      </div>
      {state.isOpen && (
        <CalendarPopover state={state} triggerRef={triggerRef}>
          <div {...dialogProps}>Boo boo</div>
        </CalendarPopover>
      )}
    </div>
  )
}
