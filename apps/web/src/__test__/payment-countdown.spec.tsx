import { addMinutes, addSeconds, subMinutes } from "date-fns"
import React, { type PropsWithChildren } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMockAttendance, createMockAttendee, createMockUser } from "../../.ladle/fixtures/attendance"

vi.mock("@dotkomonline/ui", () => ({
  Text: "p",
  Title: "p",
  Stripes: ({ children }: PropsWithChildren) => <div data-testid="completion-warning">{children}</div>,
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
  it.each([false, true])("hides deadline warnings for queued attendees (expired: %s)", (expired) => {
    const attendee = createMockAttendee({
      registered: false,
      createdAt: subMinutes(new Date(), 1),
      completionDeadline: addSeconds(new Date(), expired ? -30 : 60),
      paymentLink: "https://example.com/payment",
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })

    const markup = renderToStaticMarkup(
      <MainPoolCard attendance={attendance} user={createMockUser()} authorizeUrl="/login" />
    )

    expect(markup).toContain("i køen")
    expect(markup).toContain("100 kr")
    expect(markup).toContain("Du betaler når du får plass")
    expect(markup).not.toContain("ubetalt")
    expect(markup).not.toContain("completion-warning")
    expect(markup).not.toContain("Fullfør påmeldingen innen")
    expect(markup).not.toContain("Du har ikke betalt")

    const listMarkup = renderToStaticMarkup(
      <AttendanceStatus attendance={attendance} attendee={attendee} eventEndInPast={false} />
    )

    expect(listMarkup).not.toContain("Du har ikke betalt for arrangementet.")
  })

  it("clears payment warnings immediately after deregistration", () => {
    const attendee = createMockAttendee({
      createdAt: subMinutes(new Date(), 1),
      completionDeadline: addMinutes(new Date(), 1),
      paymentLink: "https://example.com/payment",
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })
    const updatedAttendance = patchAttendanceFromRegisterChange(attendance, { status: "deregistered", attendee })

    const markup = renderToStaticMarkup(
      <MainPoolCard attendance={updatedAttendance ?? attendance} user={createMockUser()} authorizeUrl="/login" />
    )

    expect(markup).toContain("Du er ikke påmeldt")
    expect(markup).not.toContain("completion-warning")
    expect(markup).not.toContain("Fullfør påmeldingen innen")
    expect(markup).not.toContain("Du har ikke betalt")
  })

  it.each([false, true])("explains unavailable payment without prompting an action (expired: %s)", (expired) => {
    const attendee = createMockAttendee({
      createdAt: subMinutes(new Date(), 1),
      completionDeadline: addSeconds(new Date(), expired ? -30 : 60),
      paymentLink: null,
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })

    const markup = renderToStaticMarkup(
      <MainPoolCard attendance={attendance} user={createMockUser()} authorizeUrl="/login" />
    )

    expect(markup).toContain("Du har reservert plass")
    expect(markup).toContain("100 kr ubetalt")
    expect(markup).toContain("Betalingslenken er ikke tilgjengelig.")
    expect(markup).toContain("Kontakt arrangøren for hjelp!")
    expect(markup).not.toContain("completion-warning")
    expect(markup).not.toContain("Fullfør påmeldingen innen")
    expect(markup).not.toContain("Du er påmeldt")

    const listMarkup = renderToStaticMarkup(
      <AttendanceStatus attendance={attendance} attendee={attendee} eventEndInPast={false} />
    )

    expect(listMarkup).not.toContain("Du har ikke betalt for arrangementet.")
  })

  it("shows the countdown when an unpaid attendee can open payment", () => {
    const attendee = createMockAttendee({
      createdAt: subMinutes(new Date(), 1),
      completionDeadline: addMinutes(new Date(), 1),
      paymentLink: "https://example.com/payment",
    })
    const attendance = createMockAttendance({ attendancePrice: 100, attendees: [attendee] })

    const markup = renderToStaticMarkup(
      <MainPoolCard attendance={attendance} user={createMockUser()} authorizeUrl="/login" />
    )

    expect(markup).toContain("Fullfør påmeldingen innen")
    expect(markup).toContain("100 kr ubetalt")
    expect(markup).toContain("completion-warning")
    expect(markup).not.toContain("Betalingslenken er ikke tilgjengelig")
  })

  it.each([
    null,
    "https://example.com/payment",
  ])("treats a reserved payment as complete with a leftover deadline and payment link %s", (paymentLink) => {
    const attendee = createMockAttendee({
      createdAt: subMinutes(new Date(), 1),
      completionDeadline: addMinutes(new Date(), 1),
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
    "updated",
  ] as const)("applies a %s event completing an existing attendee's payment", (status) => {
    const attendee = createMockAttendee({
      createdAt: subMinutes(new Date(), 1),
      completionDeadline: addMinutes(new Date(), 1),
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
