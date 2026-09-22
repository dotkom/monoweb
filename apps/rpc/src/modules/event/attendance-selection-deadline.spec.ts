import { addHours, addSeconds } from "date-fns"
import { describe, expect, it } from "vitest"
import {
  type AttendanceSelection,
  type AttendanceSelectionResponse,
  hasAttendeeCompletedSelections,
  resolveSelectionDeadline,
  selectionDeadlineMatchesPayment,
} from "./attendance"

const selections: AttendanceSelection[] = [
  {
    id: "selection-1",
    name: "Mat",
    options: [
      { id: "option-1", name: "Kjøtt" },
      { id: "option-2", name: "Vegetar" },
    ],
  },
]

const response = (optionId: string): AttendanceSelectionResponse => ({
  selectionId: "selection-1",
  selectionName: "Mat",
  optionId,
  optionName: "Kjøtt",
})

describe("selection deadlines", () => {
  const now = new Date("2026-09-22T12:00:00.000Z")

  it("treats missing and unknown options as incomplete", () => {
    expect(hasAttendeeCompletedSelections(selections, [])).toBe(false)
    expect(hasAttendeeCompletedSelections(selections, [response("")])).toBe(false)
    expect(hasAttendeeCompletedSelections(selections, [response("missing")])).toBe(false)
    expect(hasAttendeeCompletedSelections(selections, [response("option-2")])).toBe(true)
  })

  it("reuses a one-hour payment deadline and keeps a separate hour otherwise", () => {
    const oneHourPaymentDeadline = addHours(now, 1)
    const paymentDeadlineAfterStripe = addSeconds(oneHourPaymentDeadline, -30)
    const dayPaymentDeadline = addHours(now, 24)

    expect(resolveSelectionDeadline(null, now).getTime()).toBe(oneHourPaymentDeadline.getTime())
    expect(resolveSelectionDeadline(oneHourPaymentDeadline, now)).toBe(oneHourPaymentDeadline)
    expect(resolveSelectionDeadline(paymentDeadlineAfterStripe, now)).toBe(paymentDeadlineAfterStripe)
    expect(resolveSelectionDeadline(dayPaymentDeadline, now).getTime()).toBe(oneHourPaymentDeadline.getTime())
  })

  it("matches payment and selection deadlines that share a timestamp", () => {
    const paymentDeadline = addHours(now, 1)

    expect(
      selectionDeadlineMatchesPayment({
        paymentDeadline,
        selectionDeadline: paymentDeadline,
      })
    ).toBe(true)
    expect(
      selectionDeadlineMatchesPayment({
        paymentDeadline: addHours(now, 24),
        selectionDeadline: paymentDeadline,
      })
    ).toBe(false)
  })
})
