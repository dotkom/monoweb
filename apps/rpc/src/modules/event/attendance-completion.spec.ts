import { getCurrentUTC } from "@dotkomonline/utils"
import { addHours, addMinutes, subHours, subMinutes } from "date-fns"
import { describe, expect, it } from "vitest"
import {
  type Attendance,
  type AttendanceSelection,
  type AttendanceSelectionResponse,
  type Attendee,
  buildRegistrationAvailabilityCompletionView,
  areAttendeeSelectionsEqual,
  getActualDeregisterDeadline,
  getApplicableAttendanceCompletionRequirements,
  getAttendeeState,
  getMissedAttendanceCompletionRequirements,
  getMissingAttendanceCompletionRequirements,
  hasAttendeeCompletedSelections,
} from "./attendance"

const userId = "00000000-0000-4000-8000-000000000001"

const createAttendance = (overrides: Partial<Attendance> = {}): Attendance =>
  ({
    id: "00000000-0000-4000-8000-000000000010",
    registerStart: subMinutes(getCurrentUTC(), 60),
    registerEnd: addHours(getCurrentUTC(), 12),
    deregisterDeadline: addHours(getCurrentUTC(), 48),
    attendancePrice: 100,
    pools: [],
    attendees: [],
    selections: [],
    createdAt: getCurrentUTC(),
    updatedAt: getCurrentUTC(),
    ...overrides,
  }) as Attendance

const foodSelection: AttendanceSelection = {
  id: "selection-food",
  name: "Mat",
  options: [
    { id: "option-meat", name: "Kjøtt" },
    { id: "option-vegetarian", name: "Vegetar" },
  ],
}

const foodSelectionResponse = (optionId: string): AttendanceSelectionResponse => ({
  selectionId: foodSelection.id,
  selectionName: foodSelection.name,
  optionId,
  optionName: foodSelection.options.find((option) => option.id === optionId)?.name ?? "",
})

const createAttendee = (overrides: Partial<Attendee> = {}): Attendee =>
  ({
    id: "00000000-0000-4000-8000-000000000030",
    userId,
    attendanceId: "00000000-0000-4000-8000-000000000010",
    attendancePoolId: "00000000-0000-4000-8000-000000000020",
    createdAt: getCurrentUTC(),
    updatedAt: getCurrentUTC(),
    registered: true,
    attendedAt: null,
    earliestReservationAt: getCurrentUTC(),
    paymentChargedAt: null,
    paymentRefundedAt: null,
    completionDeadline: null,
    paymentId: null,
    paymentLink: null,
    paymentChargeDeadline: null,
    paymentReservedAt: null,
    paymentRefundedById: null,
    paymentCheckoutUrl: null,
    userGrade: 1,
    selections: [],
    user: {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
      imageUrl: null,
      createdAt: getCurrentUTC(),
      updatedAt: getCurrentUTC(),
      memberships: [],
      auth0Id: "auth0|test",
      phoneNumber: null,
      allergies: [],
      dietaryPreferences: [],
    },
    ...overrides,
  }) as Attendee

describe("attendance completion helpers", () => {
  it("returns QUEUED for waitlisted attendees", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ registered: false })

    expect(getAttendeeState(attendee, attendance)).toBe("QUEUED")
  })

  it("returns RESERVED when payment is still missing", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      completionDeadline: addMinutes(getCurrentUTC(), 45),
      paymentLink: "https://example.com/pay",
    })

    expect(getAttendeeState(attendee, attendance)).toBe("RESERVED")
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual(["PAYMENT"])
  })

  it("returns REGISTERED when payment is complete", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      paymentReservedAt: getCurrentUTC(),
    })

    expect(getAttendeeState(attendee, attendance)).toBe("REGISTERED")
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])
  })

  it("builds completion view with pending payment requirement", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      completionDeadline: addHours(getCurrentUTC(), 1),
      paymentLink: "https://example.com/pay",
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline: attendee.completionDeadline,
      requirements: [{ requirement: "PAYMENT", completed: false }],
      missingRequirements: ["PAYMENT"],
      missedRequirements: [],
      paymentLink: "https://example.com/pay",
    })
  })

  it("builds completion view for queued attendee with pending payment", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      registered: false,
      completionDeadline: addHours(getCurrentUTC(), 24),
      paymentLink: "https://example.com/pay",
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "QUEUED",
      completionDeadline: attendee.completionDeadline,
      requirements: [{ requirement: "PAYMENT", completed: false }],
      missingRequirements: [],
      missedRequirements: [],
      paymentLink: "https://example.com/pay",
    })
  })

  it("returns null completion view when attendee is absent", () => {
    const attendance = createAttendance()

    expect(buildRegistrationAvailabilityCompletionView(attendance, null)).toBeNull()
  })

  it("compares attendee selections by selection and option id", () => {
    const response = foodSelectionResponse("option-meat")

    expect(areAttendeeSelectionsEqual([response], [response])).toBe(true)
    expect(areAttendeeSelectionsEqual([response], [foodSelectionResponse("option-vegetarian")])).toBe(false)
    expect(areAttendeeSelectionsEqual([], [response])).toBe(false)
  })

  it("uses charge schedule date when it is earlier than deregister deadline", () => {
    const deregisterDeadline = addHours(getCurrentUTC(), 24)
    const chargeScheduleDate = addHours(getCurrentUTC(), 6)
    const attendance = createAttendance({ deregisterDeadline })

    expect(getActualDeregisterDeadline(attendance, chargeScheduleDate)).toEqual(chargeScheduleDate)
    expect(getActualDeregisterDeadline(attendance, null)).toEqual(deregisterDeadline)
  })

  it("detects incomplete selections", () => {
    expect(hasAttendeeCompletedSelections([foodSelection], [])).toBe(false)
    expect(hasAttendeeCompletedSelections([foodSelection], [foodSelectionResponse("")])).toBe(false)
    expect(hasAttendeeCompletedSelections([foodSelection], [foodSelectionResponse("missing")])).toBe(false)
    expect(hasAttendeeCompletedSelections([foodSelection], [foodSelectionResponse("option-meat")])).toBe(true)
  })

  it("includes selections in applicable requirements when attendance has selections", () => {
    const attendance = createAttendance({
      attendancePrice: null,
      selections: [foodSelection],
    })

    expect(getApplicableAttendanceCompletionRequirements(attendance)).toEqual(["SELECTIONS"])
  })

  it("returns RESERVED when selections are still missing", () => {
    const attendance = createAttendance({
      attendancePrice: null,
      selections: [foodSelection],
    })
    const attendee = createAttendee({
      completionDeadline: addMinutes(getCurrentUTC(), 45),
      selections: [],
    })

    expect(getAttendeeState(attendee, attendance)).toBe("RESERVED")
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual(["SELECTIONS"])
  })

  it("returns REGISTERED when selections are complete and no payment is required", () => {
    const attendance = createAttendance({
      attendancePrice: null,
      selections: [foodSelection],
    })
    const attendee = createAttendee({
      selections: [foodSelectionResponse("option-meat")],
    })

    expect(getAttendeeState(attendee, attendance)).toBe("REGISTERED")
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])
  })

  it("builds completion view with pending selections requirement", () => {
    const attendance = createAttendance({
      attendancePrice: null,
      selections: [foodSelection],
    })
    const completionDeadline = addHours(getCurrentUTC(), 1)
    const attendee = createAttendee({
      completionDeadline,
      selections: [],
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline,
      requirements: [{ requirement: "SELECTIONS", completed: false }],
      missingRequirements: ["SELECTIONS"],
      missedRequirements: [],
      paymentLink: null,
    })
  })

  it("builds completion view when both payment and selections are pending", () => {
    const attendance = createAttendance({ selections: [foodSelection] })
    const completionDeadline = addHours(getCurrentUTC(), 1)
    const attendee = createAttendee({
      completionDeadline,
      paymentLink: "https://example.com/pay",
      selections: [],
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline,
      requirements: [
        { requirement: "PAYMENT", completed: false },
        { requirement: "SELECTIONS", completed: false },
      ],
      missingRequirements: ["PAYMENT", "SELECTIONS"],
      missedRequirements: [],
      paymentLink: "https://example.com/pay",
    })
  })

  it("builds completion view when payment is complete but selections are pending", () => {
    const attendance = createAttendance({ selections: [foodSelection] })
    const completionDeadline = addHours(getCurrentUTC(), 1)
    const attendee = createAttendee({
      completionDeadline,
      paymentReservedAt: getCurrentUTC(),
      selections: [],
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline,
      requirements: [
        { requirement: "PAYMENT", completed: true },
        { requirement: "SELECTIONS", completed: false },
      ],
      missingRequirements: ["SELECTIONS"],
      missedRequirements: [],
      paymentLink: null,
    })
  })

  it("builds completion view when selections are complete but payment is pending", () => {
    const attendance = createAttendance({ selections: [foodSelection] })
    const completionDeadline = addHours(getCurrentUTC(), 1)
    const attendee = createAttendee({
      completionDeadline,
      paymentLink: "https://example.com/pay",
      selections: [foodSelectionResponse("option-meat")],
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline,
      requirements: [
        { requirement: "PAYMENT", completed: false },
        { requirement: "SELECTIONS", completed: true },
      ],
      missingRequirements: ["PAYMENT"],
      missedRequirements: [],
      paymentLink: "https://example.com/pay",
    })
  })

  it("treats incomplete selections as missed after deregister deadline", () => {
    const deregisterDeadline = subHours(getCurrentUTC(), 1)
    const attendance = createAttendance({
      attendancePrice: null,
      deregisterDeadline,
      selections: [foodSelection],
    })
    const attendee = createAttendee({
      completionDeadline: subMinutes(getCurrentUTC(), 30),
      selections: [],
    })

    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])
    expect(getMissedAttendanceCompletionRequirements(attendance, attendee)).toEqual(["SELECTIONS"])
    expect(getAttendeeState(attendee, attendance)).toBe("REGISTERED")
    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "REGISTERED",
      completionDeadline: attendee.completionDeadline,
      requirements: [{ requirement: "SELECTIONS", completed: false }],
      missingRequirements: [],
      missedRequirements: ["SELECTIONS"],
      paymentLink: null,
    })
  })

  it("keeps payment pending after deregister deadline while selections are missed", () => {
    const deregisterDeadline = subHours(getCurrentUTC(), 1)
    const attendance = createAttendance({
      deregisterDeadline,
      selections: [foodSelection],
    })
    const attendee = createAttendee({
      completionDeadline: subMinutes(getCurrentUTC(), 30),
      paymentLink: "https://example.com/pay",
      selections: [],
    })

    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual(["PAYMENT"])
    expect(getMissedAttendanceCompletionRequirements(attendance, attendee)).toEqual(["SELECTIONS"])
    expect(getAttendeeState(attendee, attendance)).toBe("RESERVED")
    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline: attendee.completionDeadline,
      requirements: [
        { requirement: "PAYMENT", completed: false },
        { requirement: "SELECTIONS", completed: false },
      ],
      missingRequirements: ["PAYMENT"],
      missedRequirements: ["SELECTIONS"],
      paymentLink: "https://example.com/pay",
    })
  })

  it("uses payment charge deadline when it is earlier than deregister deadline", () => {
    const deregisterDeadline = addHours(getCurrentUTC(), 24)
    const paymentChargeDeadline = subHours(getCurrentUTC(), 1)
    const attendance = createAttendance({
      attendancePrice: null,
      deregisterDeadline,
      selections: [foodSelection],
    })
    const attendee = createAttendee({
      paymentChargeDeadline,
      selections: [],
    })

    expect(getMissedAttendanceCompletionRequirements(attendance, attendee)).toEqual(["SELECTIONS"])
  })
})
