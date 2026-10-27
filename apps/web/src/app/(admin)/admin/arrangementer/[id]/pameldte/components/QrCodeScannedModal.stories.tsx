import type { Attendance, Attendee, AttendeeId } from "@dotkomonline/rpc/attendance"
import { Button, Text, Title } from "@dotkomonline/ui"
import { subMinutes } from "date-fns"
import { useEffect, useRef, useState } from "react"
import {
  createMockAttendance,
  createMockAttendee,
  createMockUser,
} from "../../../../../../../../.ladle/fixtures/attendance"
import { QRCodeScannedModal } from "./QrCodeScannedModal"
import { useQrCodeCheckIn } from "./use-qr-code-check-in"

type ScanScenario = {
  label: string
  attendance: Attendance
  attendeeId: AttendeeId
  saveDelayMilliseconds?: number
  failedOperation?: "registration" | "undo"
}

function createScenario(
  label: string,
  attendeeOverrides: Partial<Attendee> = {},
  attendanceOverrides: Partial<Attendance> = {},
  behavior: Pick<ScanScenario, "saveDelayMilliseconds" | "failedOperation"> = {}
): ScanScenario {
  const now = new Date()
  const attendee = createMockAttendee({ createdAt: now, registrationEligibleAt: now, ...attendeeOverrides })
  const attendees = [attendee]

  if (attendee.registeredAt === null) {
    const queuedUser = createMockUser({ id: "queued-user", name: "Kari Nordmann" })
    attendees.unshift(
      createMockAttendee({
        id: "queued-attendee",
        userId: queuedUser.id,
        user: queuedUser,
        registeredAt: null,
        createdAt: subMinutes(now, 10),
        registrationEligibleAt: subMinutes(now, 10),
      })
    )
  }

  return {
    label,
    attendance: { ...createMockAttendance({ attendancePrice: 100, attendees }), ...attendanceOverrides },
    attendeeId: attendee.id,
    ...behavior,
  }
}

function createScenarios() {
  const now = new Date()

  return {
    registered: createScenario("Registered, no payment required", {}, { attendancePrice: null }),
    zeroPrice: createScenario("Registered, zero price", {}, { attendancePrice: 0 }),
    unpaid: createScenario("Registered, unpaid — confirmation after 3 seconds"),
    paid: createScenario("Paid", { paymentChargedAt: now }),
    queued: createScenario("Second in queue, unpaid — confirmation after 3 seconds", { registeredAt: null }),
    queuedPaid: createScenario("Queued, paid", { registeredAt: null, paymentChargedAt: now }),
    alreadyAttended: createScenario("Already checked in, paid", {
      attendedAt: subMinutes(now, 15),
      paymentChargedAt: subMinutes(now, 60),
    }),
    alreadyAttendedUnpaid: createScenario("Already checked in, unpaid", {
      attendedAt: subMinutes(now, 15),
    }),
    missingAttendee: createScenario("Attendee not found", {}, { attendees: [] }),
    missingPool: createScenario("Registration pool missing", { paymentChargedAt: now }, { pools: [] }),
    noMembership: createScenario("No active membership", { user: createMockUser({ memberships: [] }) }),
    dietaryRestrictions: createScenario("Participant with dietary restrictions", {
      paymentChargedAt: now,
      user: createMockUser({ dietaryRestrictions: "Vegetar, glutenfri og allergisk mot nøtter" }),
    }),
    saving: createScenario(
      "Automatic check-in, saving",
      { paymentChargedAt: now },
      {},
      { saveDelayMilliseconds: 3_000 }
    ),
    registrationFailed: createScenario(
      "Automatic check-in failed, retry available",
      { paymentChargedAt: now },
      {},
      { failedOperation: "registration" }
    ),
    undoFailed: createScenario(
      "Undo fails once, retry available",
      { paymentChargedAt: now },
      {},
      { failedOperation: "undo" }
    ),
  } satisfies Record<string, ScanScenario>
}

function ScenarioPreview({ scenario }: { scenario: ScanScenario }) {
  const [attendance, setAttendance] = useState(scenario.attendance)
  const hasStartedScanReference = useRef(false)
  const hasFailedOperationReference = useRef(false)

  const handleUpdateAttendance = async (attendeeId: AttendeeId, attendedAt: Date | null) => {
    const saveDelayMilliseconds = scenario.saveDelayMilliseconds ?? 0

    if (saveDelayMilliseconds > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, saveDelayMilliseconds))
    }

    const requestedOperation = attendedAt === null ? "undo" : "registration"
    const shouldFailOperation = scenario.failedOperation === requestedOperation && !hasFailedOperationReference.current

    if (shouldFailOperation) {
      hasFailedOperationReference.current = true
      throw new Error("Preview operation failed")
    }

    setAttendance((currentAttendance) => ({
      ...currentAttendance,
      attendees: currentAttendance.attendees.map((attendee) => {
        if (attendee.id === attendeeId) {
          return { ...attendee, attendedAt }
        }

        return attendee
      }),
    }))
  }

  const { checkIn, scanAttendee, registerAttendance, undoAttendance, closeCheckIn } = useQrCodeCheckIn({
    attendance,
    onUpdateAttendance: handleUpdateAttendance,
  })

  useEffect(() => {
    if (hasStartedScanReference.current) {
      return
    }

    hasStartedScanReference.current = true
    scanAttendee(scenario.attendeeId)
  }, [scanAttendee, scenario.attendeeId])

  return (
    <div className="flex flex-col items-start gap-3">
      <Text>{scenario.label}</Text>
      <Button type="button" disabled={checkIn !== null} onClick={() => scanAttendee(scenario.attendeeId)}>
        Skann QR-kode på nytt
      </Button>

      {checkIn && (
        <QRCodeScannedModal
          attendance={attendance}
          checkIn={checkIn}
          onRegisterAttendance={registerAttendance}
          onUndoAttendance={undoAttendance}
          onClose={closeCheckIn}
        />
      )}
    </div>
  )
}

function ModalStory({ state }: { state: keyof ReturnType<typeof createScenarios> }) {
  const [scenario] = useState(() => createScenarios()[state])

  return <ScenarioPreview scenario={scenario} />
}

export default {
  title: "Admin/QR Code Scanned Modal",
  component: QRCodeScannedModal,
}

export const AllStates = () => {
  const [scenarios] = useState(createScenarios)
  const [selectedScenario, setSelectedScenario] = useState<ScanScenario | null>(null)
  const [previewVersion, setPreviewVersion] = useState(0)

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Title>QR-kode skannet</Title>
        <Text>
          Klare deltakere får en kort bekreftelse som lukkes automatisk. Ringen viser tiden som gjenstår. Oppmøtet kan
          angres før den lukkes. Rød bekreftelse aktiveres etter tre sekunder.
        </Text>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(scenarios).map(([state, scenario]) => (
          <Button
            key={state}
            type="button"
            variant="secondary"
            onClick={() => {
              setSelectedScenario(scenario)
              setPreviewVersion((currentVersion) => currentVersion + 1)
            }}
          >
            {scenario.label}
          </Button>
        ))}
      </div>
      {selectedScenario && <ScenarioPreview key={previewVersion} scenario={selectedScenario} />}
    </div>
  )
}

export const Registered = () => <ModalStory state="registered" />
export const ZeroPrice = () => <ModalStory state="zeroPrice" />
export const Unpaid = () => <ModalStory state="unpaid" />
export const Paid = () => <ModalStory state="paid" />
export const Queued = () => <ModalStory state="queued" />
export const QueuedPaid = () => <ModalStory state="queuedPaid" />
export const AlreadyAttended = () => <ModalStory state="alreadyAttended" />
export const AlreadyAttendedUnpaid = () => <ModalStory state="alreadyAttendedUnpaid" />
export const MissingAttendee = () => <ModalStory state="missingAttendee" />
export const MissingPool = () => <ModalStory state="missingPool" />
export const NoMembership = () => <ModalStory state="noMembership" />
export const DietaryRestrictions = () => <ModalStory state="dietaryRestrictions" />
export const Saving = () => <ModalStory state="saving" />
export const RegistrationFailed = () => <ModalStory state="registrationFailed" />
export const UndoFailed = () => <ModalStory state="undoFailed" />
