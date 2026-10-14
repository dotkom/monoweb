import { addMinutes, subMinutes } from "date-fns"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  createMockAttendance,
  createMockAttendee,
  createMockEvent,
  createMockRegistrationAvailabilityForAttendee,
  createMockUser,
} from "../../.ladle/fixtures/attendance"

const mocks = vi.hoisted(() => ({ attendanceApi: vi.fn() }))

vi.mock("@/env", () => ({ env: {} }))
vi.mock("@/utils/use-full-pathname", () => ({ useFullPathname: () => "/event" }))
vi.mock("@dotkomonline/ui", () => ({ Button: "button", Text: "p", Title: "h2", cn: () => "" }))
vi.mock("@/app/arrangementer/components/EventTurnstileProvider", () => ({ useEventTurnstile: () => null }))
vi.mock("@/app/arrangementer/components/DeregisterModal", () => ({ DeregisterModal: () => null }))
vi.mock("@/app/arrangementer/components/AttendanceCard/AttendanceCalendarButton", () => ({
  AttendanceCalendarButton: () => null,
}))
vi.mock("@/app/arrangementer/components/AttendanceCard/AttendanceDateInfo", () => ({ AttendanceDateInfo: () => null }))
vi.mock("@/app/arrangementer/components/AttendanceCard/AttendanceTurnstile", () => ({
  AttendanceTurnstile: () => null,
}))
vi.mock("@/app/arrangementer/components/AttendanceCard/EventRules", () => ({ EventRules: () => null }))
vi.mock("@/app/arrangementer/components/AttendanceCard/MainPoolCard", () => ({
  MainPoolCard: () => <div data-testid="main-pool-card" />,
}))
vi.mock("@/app/arrangementer/components/AttendanceCard/NonAttendablePoolsBox", () => ({
  NonAttendablePoolsBox: () => null,
}))
vi.mock("@/app/arrangementer/components/AttendanceCard/PaymentExplanationDialog", () => ({
  PaymentExplanationDialog: () => null,
}))
vi.mock("@/app/arrangementer/components/AttendanceCard/PunishmentBox", () => ({ PunishmentBox: () => null }))
vi.mock("@/app/arrangementer/components/AttendanceCard/RegistrationButton", () => ({
  RegistrationButton: () => null,
  getTurnstileStatus: () => "not-required",
}))
vi.mock("@/app/arrangementer/components/AttendanceCard/SelectionsForm", () => ({ SelectionsForm: () => null }))
vi.mock("@/app/arrangementer/components/AttendanceCard/TicketButton", () => ({ TicketButton: () => null }))
vi.mock("@/app/arrangementer/components/AttendanceCard/ViewAttendeesButton", () => ({
  ViewAttendeesButton: () => null,
}))
vi.mock("@/app/arrangementer/components/AttendanceCard/use-attendance-card-api", () => ({
  useAttendanceCardApi: mocks.attendanceApi,
}))

import { AttendanceCard } from "@/app/arrangementer/components/AttendanceCard/AttendanceCard"

beforeEach(() => {
  vi.stubGlobal("React", React)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("attendance card payment actions", () => {
  it.each([
    "deregistered",
    "reserved",
    "charged",
    "queued",
    "delayed",
    "delay-expired",
    "unpaid",
  ])("renders the payment link from the current attendee when availability is stale (%s)", (state) => {
    const attendee = createMockAttendee({
      completionDeadline: addMinutes(new Date(), 1),
      paymentLink: "https://example.com/payment",
    })
    const initialAttendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })
    const availability = createMockRegistrationAvailabilityForAttendee(initialAttendance, attendee)
    const updatedAttendee = {
      ...attendee,
      createdAt: subMinutes(new Date(), 2),
      registered: !["queued", "delayed", "delay-expired"].includes(state),
      earliestReservationAt: state === "delayed" ? addMinutes(new Date(), 1) : subMinutes(new Date(), 1),
      paymentReservedAt: state === "reserved" ? new Date() : null,
      paymentChargedAt: state === "charged" ? new Date() : null,
    }
    mocks.attendanceApi.mockReturnValue({
      attendance: { ...initialAttendance, attendees: state === "deregistered" ? [] : [updatedAttendee] },
      registrationAvailability: availability,
      isRegisterActionPending: false,
    })

    const markup = renderToStaticMarkup(
      <AttendanceCard
        initialAttendance={initialAttendance}
        initialRegistrationAvailability={availability}
        user={createMockUser()}
        event={createMockEvent()}
        parentEvent={null}
      />
    )

    if (state === "delayed") {
      expect(markup).toContain("Påmeldingen din behandles")
      expect(markup.indexOf("main-pool-card")).toBeLessThan(markup.indexOf("Påmeldingen din behandles"))
    } else {
      expect(markup).not.toContain("Påmeldingen din behandles")
    }

    if (state === "unpaid") {
      expect(markup).toContain("Gå til betaling")
      expect(markup).toContain(attendee.paymentLink)
    } else {
      expect(markup).not.toContain("Gå til betaling")
      expect(markup).not.toContain(attendee.paymentLink)
    }
  })
})
