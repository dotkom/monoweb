import { FC, ReactNode, RefObject, useRef } from "react"
import { usePopover, Overlay, DismissButton } from "@react-aria/overlays"
import { DatePickerState } from "@react-stately/datepicker"

export type CalendarPopoverProps = {
  state: DatePickerState
  children: ReactNode
  triggerRef: RefObject<HTMLButtonElement>
}

export const CalendarPopover: FC<CalendarPopoverProps> = ({ ...props }) => {
  let ref = useRef<HTMLDivElement>(null)
  let { state, children, triggerRef } = props

  let { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef: ref,
      triggerRef,
    },
    state
  )

  return (
    <Overlay>
      <div {...underlayProps} className="fixed inset-0" />
      <div
        {...popoverProps}
        ref={ref}
        className="absolute top-full z-10 mt-2 rounded-md border border-gray-300 bg-white p-8 shadow-lg"
      >
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  )
}
