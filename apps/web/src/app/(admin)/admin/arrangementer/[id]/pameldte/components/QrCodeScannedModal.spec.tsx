// @vitest-environment jsdom

import type { Attendance, Attendee, AttendeeId } from "@dotkomonline/rpc/attendance"
import React, { act, type ComponentProps, type PropsWithChildren } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMockAttendance, createMockAttendee } from "../../../../../../../../.ladle/fixtures/attendance"
import { QRCodeScannedModal } from "./QrCodeScannedModal"
import { useQrCodeCheckIn } from "./use-qr-code-check-in"

const mocks = vi.hoisted(() => ({ updateAttendance: vi.fn() }))

vi.mock("../../../../hooks/use-is-mobile", () => ({ useIsMobile: () => false }))
vi.mock("./UserBox", () => ({ UserBox: () => null }))
vi.mock("@dotkomonline/ui", () => ({
  AlertDialog: ({ children }: PropsWithChildren) => <div role="alertdialog">{children}</div>,
  AlertDialogContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
  AlertDialogTitle: "h2",
  AlertDialogCancel: "button",
  Button: ({
    children,
    color,
    variant: _variant,
    ...props
  }: ComponentProps<"button"> & { color?: string; variant?: string }) => (
    <button {...props} data-color={color}>
      {children}
    </button>
  ),
  Text: "p",
  Title: ({ children }: PropsWithChildren) => <h3>{children}</h3>,
  RadialProgress: ({ percentage, hideText }: { percentage: number; hideText: boolean }) => (
    <div role="progressbar" aria-valuenow={percentage} data-hide-text={hideText} />
  ),
}))

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  mocks.updateAttendance.mockResolvedValue(undefined)

  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  expect(vi.getTimerCount()).toBe(0)

  container.remove()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function TestScanner({ attendance, attendeeId }: { attendance: Attendance; attendeeId: AttendeeId }) {
  const { checkIn, scanAttendee, registerAttendance, undoAttendance, closeCheckIn } = useQrCodeCheckIn({
    attendance,
    onUpdateAttendance: mocks.updateAttendance,
  })

  return (
    <>
      <button type="button" onClick={() => scanAttendee(attendeeId)}>
        Skann
      </button>

      {checkIn && (
        <QRCodeScannedModal
          attendance={attendance}
          checkIn={checkIn}
          onRegisterAttendance={registerAttendance}
          onUndoAttendance={undoAttendance}
          onClose={closeCheckIn}
        />
      )}
    </>
  )
}

type RenderScannerOptions = {
  attendeeOverrides?: Partial<Attendee>
  attendanceOverrides?: Partial<Attendance>
  attendancePrice?: number | null
}

async function renderScanner({
  attendeeOverrides = {},
  attendanceOverrides = {},
  attendancePrice = 100,
}: RenderScannerOptions = {}) {
  const attendee = createMockAttendee(attendeeOverrides)
  const attendance = {
    ...createMockAttendance({ attendancePrice, attendees: [attendee] }),
    ...attendanceOverrides,
  }

  await act(async () => {
    root.render(
      <React.StrictMode>
        <TestScanner attendance={attendance} attendeeId={attendee.id} />
      </React.StrictMode>
    )
  })

  return { attendance, attendeeId: attendee.id }
}

function getButton(label: string) {
  const buttons = Array.from(container.querySelectorAll("button"))
  const button = buttons.find((button) => button.textContent === label)

  if (!button) {
    throw new Error(`Button not found: ${label}`)
  }

  return button
}

async function clickButton(label: string) {
  await act(async () => getButton(label).click())
}

describe("QR code check-in", () => {
  it.each([
    { name: "no payment required", attendancePrice: null, attendeeOverrides: {} },
    { name: "zero price", attendancePrice: 0, attendeeOverrides: {} },
    { name: "charged", attendancePrice: 100, attendeeOverrides: { paymentChargedAt: new Date() } },
    { name: "payment authorized", attendancePrice: 100, attendeeOverrides: { paymentReservedAt: new Date() } },
  ])("automatically checks in an eligible attendee when $name", async ({ attendancePrice, attendeeOverrides }) => {
    const { attendeeId } = await renderScanner({ attendeeOverrides, attendancePrice })
    expect(mocks.updateAttendance).not.toHaveBeenCalled()

    await clickButton("Skann")

    expect(mocks.updateAttendance).toHaveBeenCalledExactlyOnceWith(attendeeId, expect.any(Date))
    expect(container.textContent).toContain("Oppmøte registrert")
    expect(getButton("Angre").disabled).toBe(false)
    expect(getButton("Angre").dataset.color).toBe("red")
    expect(getButton("Lukk").dataset.color).toBe("gray")
    expect(container.textContent).toContain("Jan Teigen")
    expect(container.textContent).not.toContain("Påmeldingsinformasjon")
    expect(container.textContent).not.toContain("Du har skannet")
    expect(container.textContent).not.toContain("Lukkes automatisk")
    expect(() => getButton("Ja")).toThrow("Button not found")
    expect(vi.getTimerCount()).toBe(1)
  })

  it.each([
    { name: "unpaid", attendeeOverrides: {}, attendancePrice: 100 },
    { name: "queued for a free event", attendeeOverrides: { registered: false }, attendancePrice: null },
    {
      name: "queued but paid",
      attendeeOverrides: { registered: false, paymentChargedAt: new Date() },
      attendancePrice: 100,
    },
    {
      name: "refunded after being charged",
      attendeeOverrides: { paymentChargedAt: new Date(), paymentReservedAt: new Date(), paymentRefundedAt: new Date() },
      attendancePrice: 100,
    },
    { name: "payment cancelled", attendeeOverrides: { paymentRefundedById: "organizer" }, attendancePrice: 100 },
  ])("requires three seconds before manual check-in when $name", async ({ attendeeOverrides, attendancePrice }) => {
    const { attendeeId } = await renderScanner({ attendeeOverrides, attendancePrice })
    await clickButton("Skann")

    expect(getButton("Ja (3)").dataset.color).toBe("red")
    expect(getButton("Ja (3)").disabled).toBe(true)
    await clickButton("Ja (3)")
    expect(mocks.updateAttendance).not.toHaveBeenCalled()

    await act(async () => vi.advanceTimersByTime(1_000))
    expect(getButton("Ja (2)").disabled).toBe(true)
    await act(async () => vi.advanceTimersByTime(1_000))
    expect(getButton("Ja (1)").disabled).toBe(true)
    await act(async () => vi.advanceTimersByTime(999))
    expect(getButton("Ja (1)").disabled).toBe(true)
    await act(async () => vi.advanceTimersByTime(1))

    expect(getButton("Ja").disabled).toBe(false)
    await clickButton("Ja")

    expect(mocks.updateAttendance).toHaveBeenCalledExactlyOnceWith(attendeeId, expect.any(Date))
    expect(container.textContent).toContain("Oppmøte registrert")
    expect(getButton("Angre").disabled).toBe(false)
    expect(vi.getTimerCount()).toBe(0)

    await act(async () => vi.advanceTimersByTime(6_000))
    expect(getButton("Lukk").disabled).toBe(false)
  })

  it.each([false, true])("leaves an existing check-in read-only (paid: %s)", async (hasPaid) => {
    const attendedAt = new Date("2026-10-18T10:00:00Z")
    const paymentChargedAt = hasPaid ? new Date() : null

    await renderScanner({ attendeeOverrides: { attendedAt, paymentChargedAt } })
    await clickButton("Skann")

    expect(container.textContent).toContain("Allerede registrert")
    expect(container.textContent).toContain("18. okt. 2026")
    expect(container.textContent).not.toContain("Angre")
    expect(container.textContent).not.toContain("Ja")
    expect(mocks.updateAttendance).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)

    await act(async () => vi.advanceTimersByTime(6_000))
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()

    await clickButton("Neste")
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
  })

  it("undoes only this scan's check-in and leaves it undone through rerenders", async () => {
    const options = { attendeeOverrides: { paymentChargedAt: new Date() } }
    const { attendeeId } = await renderScanner(options)

    await clickButton("Skann")
    await clickButton("Angre")

    expect(mocks.updateAttendance).toHaveBeenLastCalledWith(attendeeId, null)
    expect(container.textContent).toContain("Oppmøte angret")
    expect(container.textContent).not.toContain("Oppmøte registrert")
    expect(container.textContent).not.toContain("Angre")
    expect(container.textContent).not.toContain("Ja")

    await renderScanner(options)
    await act(async () => vi.advanceTimersByTime(5_000))
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(2)

    await clickButton("Neste")
    await clickButton("Skann")
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(3)
  })

  it("ignores duplicate scans and rerenders while a scan is open", async () => {
    const options = { attendeeOverrides: { paymentChargedAt: new Date() } }
    await renderScanner(options)

    await act(async () => {
      getButton("Skann").click()
      getButton("Skann").click()
    })
    await renderScanner(options)

    expect(mocks.updateAttendance).toHaveBeenCalledTimes(1)
    expect(container.textContent).toContain("Oppmøte registrert")
  })

  it("shows radial progress and automatically closes a successful check-in after three seconds", async () => {
    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date() } })
    await clickButton("Skann")

    const progressIndicator = container.querySelector('[role="progressbar"]')
    expect(progressIndicator?.getAttribute("aria-valuenow")).toBe("100")
    expect(progressIndicator?.getAttribute("data-hide-text")).toBe("true")

    await act(async () => vi.advanceTimersByTime(1_500))
    expect(progressIndicator?.getAttribute("aria-valuenow")).toBe("50")

    await act(async () => vi.advanceTimersByTime(1_499))
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()

    await act(async () => vi.advanceTimersByTime(1))
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("clears the previous close timer when manually closed and starts a new timer for the next scan", async () => {
    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date() } })
    await clickButton("Skann")
    await act(async () => vi.advanceTimersByTime(2_000))
    await clickButton("Lukk")

    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(vi.getTimerCount()).toBe(0)

    await renderScanner({ attendeeOverrides: { id: "next-attendee", paymentChargedAt: new Date() } })
    await clickButton("Skann")
    await act(async () => vi.advanceTimersByTime(1_000))
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()

    await act(async () => vi.advanceTimersByTime(2_000))
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(2)
  })

  it("waits for saving before showing success and keeps the scan open while pending", async () => {
    let completeSave: () => void = () => {}
    const pendingSave = new Promise<void>((resolve) => {
      completeSave = resolve
    })
    mocks.updateAttendance.mockReturnValueOnce(pendingSave)

    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date() } })
    await clickButton("Skann")

    expect(container.textContent).toContain("Registrerer oppmøte")
    expect(container.textContent).not.toContain("Oppmøte registrert")
    expect(getButton("Neste").disabled).toBe(true)

    const closeButton = container.querySelector<HTMLButtonElement>('button[aria-label="Lukk"]')
    expect(closeButton?.disabled).toBe(true)

    await clickButton("Neste")
    await clickButton("Skann")
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(1)

    await act(async () => vi.advanceTimersByTime(6_000))
    expect(container.textContent).toContain("Registrerer oppmøte")
    expect(vi.getTimerCount()).toBe(0)

    await act(async () => completeSave())

    expect(container.textContent).toContain("Oppmøte registrert")
    expect(getButton("Angre").disabled).toBe(false)

    await act(async () => vi.advanceTimersByTime(2_999))
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()

    await act(async () => vi.advanceTimersByTime(1))
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
  })

  it("shows failed registration and retries only after an explicit action", async () => {
    mocks.updateAttendance.mockRejectedValueOnce(new Error("Registration failed"))

    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date() } })
    await clickButton("Skann")

    expect(container.textContent).toContain("Kunne ikke registrere oppmøte")
    expect(container.textContent).not.toContain("Oppmøte registrert")
    expect(container.textContent).not.toContain("Angre")

    await act(async () => vi.advanceTimersByTime(5_000))
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(1)

    await clickButton("Prøv igjen")
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain("Oppmøte registrert")
  })

  it("keeps a saved check-in when undo fails and lets the admin retry undo", async () => {
    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date() } })
    await clickButton("Skann")

    mocks.updateAttendance.mockRejectedValueOnce(new Error("Undo failed"))
    await clickButton("Angre")

    expect(container.textContent).toContain("Kunne ikke angre. Oppmøtet er fortsatt registrert.")
    expect(container.textContent).not.toContain("Oppmøte angret")

    await act(async () => vi.advanceTimersByTime(6_000))
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()

    await clickButton("Prøv å angre igjen")

    expect(container.textContent).toContain("Oppmøte angret")
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(3)
  })

  it("does not close or submit another scan while undo is pending", async () => {
    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date() } })
    await clickButton("Skann")

    let completeUndo: () => void = () => {}
    const pendingUndo = new Promise<void>((resolve) => {
      completeUndo = resolve
    })
    mocks.updateAttendance.mockReturnValueOnce(pendingUndo)

    await clickButton("Angre")
    expect(container.textContent).toContain("Angrer oppmøte")
    expect(getButton("Neste").disabled).toBe(true)

    await clickButton("Neste")
    await clickButton("Skann")
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(2)

    await act(async () => vi.advanceTimersByTime(6_000))
    expect(container.textContent).toContain("Angrer oppmøte")
    expect(vi.getTimerCount()).toBe(0)

    await act(async () => completeUndo())
    expect(container.textContent).toContain("Oppmøte angret")
  })

  it("restarts manual confirmation after closing and scanning another attendee", async () => {
    await renderScanner()
    await clickButton("Skann")
    await act(async () => vi.advanceTimersByTime(3_000))

    await clickButton("Nei")
    expect(vi.getTimerCount()).toBe(0)

    await renderScanner({ attendeeOverrides: { id: "next-attendee" } })
    await clickButton("Skann")

    expect(getButton("Ja (3)").disabled).toBe(true)
    expect(mocks.updateAttendance).not.toHaveBeenCalled()
  })

  it("shows registration and unpaid status without payment setup or deadline details", async () => {
    await renderScanner({ attendeeOverrides: { completionDeadline: new Date(0), paymentLink: null } })
    await clickButton("Skann")

    expect(container.textContent).toContain("Påmeldt")
    expect(container.textContent).toContain("100 kr ubetalt")
    expect(container.textContent).not.toContain("Reservert plass")
    expect(container.textContent).not.toContain("Betalingslenken")
    expect(container.textContent).not.toContain("Fullfør")
  })

  it("preserves this scan's success when refreshed attendance includes the saved timestamp", async () => {
    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date() } })
    await clickButton("Skann")
    await act(async () => vi.advanceTimersByTime(1_000))

    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date(), attendedAt: new Date() } })

    expect(container.textContent).toContain("Oppmøte registrert")
    expect(container.textContent).not.toContain("Allerede registrert")
    expect(getButton("Angre").disabled).toBe(false)
    expect(mocks.updateAttendance).toHaveBeenCalledTimes(1)

    await act(async () => vi.advanceTimersByTime(1_999))
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()

    await act(async () => vi.advanceTimersByTime(1))
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
  })

  it("shows an existing check-in if another admin registers the attendee during confirmation", async () => {
    await renderScanner()
    await clickButton("Skann")
    await renderScanner({ attendeeOverrides: { attendedAt: new Date() } })

    expect(container.textContent).toContain("Allerede registrert")
    expect(container.textContent).not.toContain("Ja")
    expect(container.textContent).not.toContain("Angre")
    expect(mocks.updateAttendance).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each([
    { attendanceOverrides: { attendees: [] }, expectedMessage: "Ingen deltaker funnet" },
    { attendanceOverrides: { pools: [] }, expectedMessage: "Gruppe mangler" },
  ])("does not check in an attendee when $expectedMessage", async ({ attendanceOverrides, expectedMessage }) => {
    await renderScanner({ attendeeOverrides: { paymentChargedAt: new Date() }, attendanceOverrides })
    await clickButton("Skann")

    expect(container.textContent).toContain(expectedMessage)
    expect(container.textContent).not.toContain("Ja")
    expect(container.textContent).not.toContain("Angre")
    expect(mocks.updateAttendance).not.toHaveBeenCalled()
    expect(getButton("Neste").disabled).toBe(false)
  })
})
