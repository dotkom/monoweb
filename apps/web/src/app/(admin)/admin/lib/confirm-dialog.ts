const DISMISSAL_REASONS = new Set(["escape-key", "outside-press", "focus-out"])

export type DialogChangeEventDetails = {
  reason: string
  cancel: () => void
}

export function closeOnlyOnChoice(onOpenChange: (open: boolean) => void) {
  return (open: boolean, eventDetails: DialogChangeEventDetails) => {
    if (!open && DISMISSAL_REASONS.has(eventDetails.reason)) {
      eventDetails.cancel()
      return
    }

    onOpenChange(open)
  }
}
