import { describe, expect, it } from "vitest"
import {
  createMockAttendance,
  createMockAttendee,
  createMockRegistrationAvailability,
  createMockRegistrationAvailabilityForAttendee,
} from "../../.ladle/fixtures/attendance"
import {
  getAttendanceCardRegistrationAvailability,
  getDeregisterGracePeriodEnd,
} from "@/app/arrangementer/components/AttendanceCard/getAttendanceCardRegistrationAvailability"

describe("attendance card availability", () => {
  const now = new Date("2026-10-13T12:00:00Z")

  it("waits for registration availability after the attendee is removed", () => {
    const attendee = createMockAttendee({ paymentLink: "https://example.com/payment" })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })
    const availability = createMockRegistrationAvailabilityForAttendee(attendance, attendee)

    expect(getAttendanceCardRegistrationAvailability(attendance, null, availability, now)).toBeUndefined()
  })

  it("waits for deregistration availability after an attendee is added or replaced", () => {
    const attendee = createMockAttendee()
    const attendance = createMockAttendance({ attendees: [attendee] })

    expect(
      getAttendanceCardRegistrationAvailability(attendance, attendee, createMockRegistrationAvailability(), now)
    ).toBeUndefined()

    const availability = createMockRegistrationAvailabilityForAttendee(attendance, attendee)
    expect(
      getAttendanceCardRegistrationAvailability(attendance, { ...attendee, id: "new-registration" }, availability, now)
    ).toBeUndefined()
  })

  it("uses a payment reservation from the attendee before availability has refetched", () => {
    const attendee = createMockAttendee({
      createdAt: now,
      completionDeadline: new Date(now.getTime() + 60_000),
      paymentLink: "https://example.com/payment",
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })
    const availability = createMockRegistrationAvailabilityForAttendee(attendance, attendee)
    const result = getAttendanceCardRegistrationAvailability(
      attendance,
      { ...attendee, paymentReservedAt: now },
      availability,
      now
    )

    expect(result?.completion?.missingRequirements).toEqual([])
  })

  it.each([true, false])("updates the deadline while preserving queue eligibility (registered: %s)", (registered) => {
    const attendee = createMockAttendee({ createdAt: now, registered })
    const attendance = {
      ...createMockAttendance({ attendees: [attendee] }),
      deregisterDeadline: new Date(now.getTime() + 1_000),
    }
    const availability = createMockRegistrationAvailabilityForAttendee(attendance, attendee)

    expect(
      getAttendanceCardRegistrationAvailability(attendance, attendee, availability, now)?.deregistration?.canDeregister
    ).toBe(true)

    const result = getAttendanceCardRegistrationAvailability(
      attendance,
      attendee,
      availability,
      attendance.deregisterDeadline
    )

    expect(result?.deregistration?.canDeregister).toBe(!registered)
    expect(result?.deregistration?.isPastDeregisterDeadline).toBe(true)
  })

  it("uses an earlier charge date as the deregistration deadline", () => {
    const attendee = createMockAttendee({ createdAt: now })
    const attendance = createMockAttendance({ attendees: [attendee] })
    const availability = createMockRegistrationAvailabilityForAttendee(attendance, attendee)
    if (availability.deregistration === null) {
      throw new Error("Expected deregistration availability")
    }
    availability.deregistration.chargeScheduleDate = now

    const result = getAttendanceCardRegistrationAvailability(attendance, attendee, availability, now)

    expect(result?.deregistration?.actualDeregisterDeadline).toEqual(now)
    expect(result?.deregistration?.rejectionCause).toBe("DEREGISTER_DEADLINE_PASSED")
  })

  it("requires a reason when the grace period expires, including the clock skew buffer", () => {
    const attendee = createMockAttendee({ createdAt: now })
    const attendance = createMockAttendance({ attendees: [attendee] })
    const availability = createMockRegistrationAvailabilityForAttendee(attendance, attendee)
    const gracePeriodEnd = getDeregisterGracePeriodEnd(attendee)
    if (gracePeriodEnd === null) {
      throw new Error("Expected grace period end")
    }

    expect(gracePeriodEnd.getTime() - now.getTime()).toBe(2 * 60 * 60 * 1_000 - 15_000)
    const result = getAttendanceCardRegistrationAvailability(attendance, attendee, availability, gracePeriodEnd)

    expect(result?.deregistration?.isWithinGracePeriod).toBe(false)
    expect(result?.deregistration?.requiresDeregisterReason).toBe(true)
  })

  it("disables deregistration as soon as the attendee has been charged", () => {
    const attendee = createMockAttendee({ createdAt: now })
    const attendance = createMockAttendance({ attendees: [attendee] })
    const availability = createMockRegistrationAvailabilityForAttendee(attendance, attendee)
    const result = getAttendanceCardRegistrationAvailability(
      attendance,
      { ...attendee, paymentChargedAt: now },
      availability,
      now
    )

    expect(result?.deregistration?.rejectionCause).toBe("PAYMENT_COMPLETED")
    expect(result?.deregistration?.canDeregister).toBe(false)
  })
})
