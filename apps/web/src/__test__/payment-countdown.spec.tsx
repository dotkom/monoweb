import React, { type PropsWithChildren } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMockAttendance, createMockAttendee, createMockUser } from "../../.ladle/fixtures/attendance"

vi.mock("@dotkomonline/ui", () => ({
  Text: "p",
  Title: "p",
  Stripes: ({ children }: PropsWithChildren) => children,
  Tooltip: ({ children }: PropsWithChildren) => children,
  TooltipContent: ({ children }: PropsWithChildren) => children,
  TooltipTrigger: ({ children }: PropsWithChildren) => children,
  cn: () => "",
}))

vi.mock("@/components/RollingNumber", () => ({
  RollingNumber: ({ value }: { value: number }) => String(value),
}))

import { MainPoolCard } from "@/app/arrangementer/components/AttendanceCard/MainPoolCard"
import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import { patchAttendanceFromRegisterChange } from "@/app/arrangementer/components/AttendanceCard/patchAttendanceFromRegisterChange"
import { buildRegistrationAvailabilityCompletionView, getAttendeePaymentStatus } from "@dotkomonline/rpc/attendance"

beforeEach(() => {
  vi.stubGlobal("React", React)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("event payment countdown", () => {
  it.each([false, true])("keeps an unpaid attendance incomplete without a payment link (expired: %s)", (expired) => {
    const attendee = createMockAttendee({
      createdAt: new Date(Date.now() - 60_000),
      completionDeadline: new Date(Date.now() + (expired ? -30_000 : 60_000)),
      paymentLink: null,
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })

    const markup = renderToStaticMarkup(
      <MainPoolCard attendance={attendance} user={createMockUser()} authorizeUrl="/login" />
    )

    expect(markup).toContain("Fullfør påmeldingen innen")
    expect(markup).toContain("Du har reservert plass")
    expect(markup).toContain("Du har ikke betalt")
  })

  it("shows the countdown when an unpaid attendee can open payment", () => {
    const attendee = createMockAttendee({
      createdAt: new Date(Date.now() - 60_000),
      completionDeadline: new Date(Date.now() + 60_000),
      paymentLink: "https://example.com/payment",
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })

    const markup = renderToStaticMarkup(
      <MainPoolCard attendance={attendance} user={createMockUser()} authorizeUrl="/login" />
    )

    expect(markup).toContain("Fullfør påmeldingen innen")
    expect(markup).toContain("Du har ikke betalt")
  })

  it.each([
    null,
    "https://example.com/payment",
  ])("treats a reserved payment as complete with a leftover deadline and payment link %s", (paymentLink) => {
    const attendee = createMockAttendee({
      createdAt: new Date(Date.now() - 60_000),
      completionDeadline: new Date(Date.now() + 60_000),
      paymentReservedAt: new Date(),
      paymentLink,
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })

    const markup = renderToStaticMarkup(
      <MainPoolCard attendance={attendance} user={createMockUser()} authorizeUrl="/login" />
    )

    expect(markup).toContain("Du har reservert 100 kr")
    expect(markup).not.toContain("Fullfør påmeldingen innen")
    expect(markup).not.toContain("Du har ikke betalt")
    expect(markup).toContain("Du er påmeldt")

    const listMarkup = renderToStaticMarkup(
      <AttendanceStatus attendance={attendance} attendee={attendee} eventEndInPast={false} />
    )

    expect(listMarkup).not.toContain("Du har ikke betalt for arrangementet.")
    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)?.missingRequirements).toEqual([])
  })

  it.each([
    "registered",
    "reserved",
  ] as const)("applies a %s event completing an existing attendee's payment", (status) => {
    const attendee = createMockAttendee({
      createdAt: new Date(Date.now() - 60_000),
      completionDeadline: new Date(Date.now() + 60_000),
      paymentLink: "https://example.com/payment",
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })
    const updatedAttendee = { ...attendee, paymentReservedAt: new Date(), paymentLink: null }

    const updatedAttendance = patchAttendanceFromRegisterChange(attendance, { status, attendee: updatedAttendee })

    expect(updatedAttendance?.attendees).toEqual([updatedAttendee])
    expect(getAttendeePaymentStatus(updatedAttendee)).toBe("reserved")

    const markup = renderToStaticMarkup(
      <MainPoolCard attendance={updatedAttendance ?? attendance} user={createMockUser()} authorizeUrl="/login" />
    )

    expect(markup).toContain("Du er påmeldt")
    expect(markup).toContain("Du har reservert 100 kr")
    expect(markup).not.toContain("Fullfør påmeldingen innen")
  })
})
