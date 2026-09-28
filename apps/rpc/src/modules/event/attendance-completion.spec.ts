import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addHours, addMinutes, subHours, subMinutes } from "date-fns"
import { describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import { DEFAULT_MARK_DURATION, type Mark } from "../mark/mark"
import type { Payment } from "../payment/payment-service"
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
import { getAttendanceService } from "./attendance-service"
import type { Event } from "./event"

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
    registeredAt: new Date(),
    attendedAt: null,
    registrationPoolDelayHours: null,
    registrationMarkDelayHours: null,
    registrationEligibleAt: getCurrentUTC(),
    paymentChargedAt: null,
    paymentRefundedAt: null,
    completionDeadline: null,
    paymentId: null,
    paymentLink: null,
    paymentChargeDeadline: null,
    paymentReservedAt: null,
    paymentRefundedByUserId: null,
    adminRegisteredByUserId: null,
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
  it("returns QUEUED for queued attendees", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ registeredAt: null })

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

  it("ignores completion requirements and leftover payment details while the attendee is queued", () => {
    const attendance = createAttendance({
      selections: [foodSelection],
      deregisterDeadline: subHours(getCurrentUTC(), 1),
    })
    const attendee = createAttendee({
      registeredAt: null,
      completionDeadline: addHours(getCurrentUTC(), 24),
      paymentLink: "https://example.com/pay",
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "QUEUED",
      completionDeadline: null,
      requirements: [],
      missingRequirements: [],
      missedRequirements: [],
      paymentLink: null,
    })
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])
  })

  it("requires payment after a queued attendee receives a place", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ registeredAt: null })

    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])

    const promotedAttendee = {
      ...attendee,
      registeredAt: new Date(),
      completionDeadline: addHours(getCurrentUTC(), 24),
      paymentLink: "https://example.com/pay",
    }

    expect(buildRegistrationAvailabilityCompletionView(attendance, promotedAttendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline: promotedAttendee.completionDeadline,
      requirements: [{ requirement: "PAYMENT", completed: false }],
      missingRequirements: ["PAYMENT"],
      missedRequirements: [],
      paymentLink: promotedAttendee.paymentLink,
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

function createPaymentVerificationContext(deregisterDeadline: Date, paymentStatus: "UNPAID" | "PAID") {
  const handle = mock<DBHandle>()
  const attendanceRepository = mock<Parameters<typeof getAttendanceService>[1]>()
  const taskSchedulingService = mock<Parameters<typeof getAttendanceService>[2]>()
  const markService = mock<Parameters<typeof getAttendanceService>[4]>()
  const personalMarkService = mock<Parameters<typeof getAttendanceService>[5]>()
  const paymentService = mock<Parameters<typeof getAttendanceService>[6]>()
  const eventService = mock<Parameters<typeof getAttendanceService>[8]>()
  const attendee = createAttendee({ paymentId: "payment", completionDeadline: subMinutes(getCurrentUTC(), 1) })
  const attendance = createAttendance({ attendees: [attendee], deregisterDeadline })
  const event = mock<Event>({ id: "test-event", title: "Test event", hostingGroups: [] })

  attendanceRepository.findAttendanceByAttendeeId.mockResolvedValue(attendance)
  taskSchedulingService.findVerifyAttendanceCompletionTask.mockResolvedValue(null)
  eventService.getByAttendanceId.mockResolvedValue(event)
  paymentService.getById.mockResolvedValue(mock<Payment>({ status: paymentStatus }))
  markService.create
    .mockResolvedValueOnce(mock<Mark>({ id: "suspension" }))
    .mockResolvedValueOnce(mock<Mark>({ id: "missing-payment-mark" }))

  const attendanceService = getAttendanceService(
    new EventEmitter(),
    attendanceRepository,
    taskSchedulingService,
    mock(),
    markService,
    personalMarkService,
    paymentService,
    mock(),
    eventService,
    mock(),
    mock(),
    mock(),
    mock()
  )

  return { handle, attendee, attendance, attendanceService, markService, personalMarkService }
}

describe("missing payment penalties", () => {
  it("only assigns a selections mark when selections are missing without required payment", async () => {
    const { handle, attendee, attendance, attendanceService, markService, personalMarkService } =
      createPaymentVerificationContext(addHours(getCurrentUTC(), 1), "UNPAID")
    attendance.attendancePrice = null
    attendance.selections = [foodSelection]
    markService.create.mockReset().mockResolvedValue(mock<Mark>({ id: "missing-selections-mark" }))
    const deregisterAttendee = vi.spyOn(attendanceService, "deregisterAttendee").mockResolvedValue()

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(markService.create).toHaveBeenCalledExactlyOnceWith(
      handle,
      expect.objectContaining({ type: "MISSING_SELECTIONS", weight: 2, duration: DEFAULT_MARK_DURATION }),
      []
    )
    expect(personalMarkService.addToUser).toHaveBeenCalledExactlyOnceWith(
      handle,
      attendee.userId,
      "missing-selections-mark"
    )
    expect(deregisterAttendee).toHaveBeenCalledWith(handle, attendee.id, { ignoreDeregistrationWindow: true })
  })

  it("assigns a suspension and a separate one-point mark after the deregistration deadline", async () => {
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentVerificationContext(
      subMinutes(getCurrentUTC(), 60),
      "UNPAID"
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(markService.create).toHaveBeenCalledTimes(2)
    expect(markService.create).toHaveBeenNthCalledWith(
      1,
      handle,
      expect.objectContaining({ type: "MISSING_PAYMENT", weight: 6, duration: 100_000 }),
      []
    )
    expect(markService.create).toHaveBeenNthCalledWith(
      2,
      handle,
      expect.objectContaining({ type: "MISSING_PAYMENT", weight: 1, duration: DEFAULT_MARK_DURATION }),
      []
    )
    expect(personalMarkService.addToUser).toHaveBeenCalledTimes(2)
    expect(personalMarkService.addToUser).toHaveBeenCalledWith(handle, attendee.userId, "suspension")
    expect(personalMarkService.addToUser).toHaveBeenCalledWith(handle, attendee.userId, "missing-payment-mark")
  })

  it("deregisters an unpaid attendee before the deregistration deadline without assigning penalties", async () => {
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentVerificationContext(
      addHours(getCurrentUTC(), 1),
      "UNPAID"
    )
    const deregisterAttendee = vi.spyOn(attendanceService, "deregisterAttendee").mockResolvedValue()

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(deregisterAttendee).toHaveBeenCalledWith(handle, attendee.id, { ignoreDeregistrationWindow: true })
    expect(markService.create).not.toHaveBeenCalled()
    expect(personalMarkService.addToUser).not.toHaveBeenCalled()
  })

  it("does not assign penalties when payment has succeeded", async () => {
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentVerificationContext(
      subMinutes(getCurrentUTC(), 60),
      "PAID"
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(markService.create).not.toHaveBeenCalled()
    expect(personalMarkService.addToUser).not.toHaveBeenCalled()
  })
})
