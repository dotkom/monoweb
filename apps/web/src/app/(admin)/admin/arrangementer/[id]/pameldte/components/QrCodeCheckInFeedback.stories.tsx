import type { Attendance, Attendee } from "@dotkomonline/rpc/attendance"
import { Button } from "@dotkomonline/ui"
import { useEffect, useState } from "react"
import { createMockAttendance, createMockAttendee } from "../../../../../../../../.ladle/fixtures/attendance"
import { QrCodeCheckInFeedback } from "./QrCodeCheckInFeedback"
import type { QrCodeCheckIn, QrCodeCheckInStatus } from "./qr-code-check-in"
import { useQrCodeCheckIn } from "./use-qr-code-check-in"

type PreviewProps = {
  status?: QrCodeCheckInStatus
  attendeeOverrides?: Partial<Attendee>
  attendanceOverrides?: Partial<Attendance>
}

function Preview({
  status = "confirmation-required",
  attendeeOverrides = {},
  attendanceOverrides = {},
  onClose,
}: PreviewProps & { onClose: () => void }) {
  const [scenario] = useState(() => {
    const attendee = createMockAttendee(attendeeOverrides)
    const attendance = {
      ...createMockAttendance({ attendancePrice: 100, attendees: [attendee] }),
      ...attendanceOverrides,
    }
    const checkInDetails = { attendeeId: attendee.id, isAutomaticCheckIn: false }
    const initialCheckIn: QrCodeCheckIn =
      status === "registered" || status === "already-attended"
        ? { ...checkInDetails, status, attendedAt: new Date() }
        : { ...checkInDetails, status, attendedAt: status === "undo-failed" ? new Date() : null }

    return { attendance, initialCheckIn }
  })
  const [checkIn, setCheckIn] = useState<QrCodeCheckIn>(scenario.initialCheckIn)

  useEffect(() => {
    if (checkIn.status !== "registering" && checkIn.status !== "undoing") {
      return
    }

    const isUndoing = checkIn.status === "undoing"
    const saveTimeout = setTimeout(() => {
      setCheckIn((currentCheckIn) => {
        return isUndoing
          ? { ...currentCheckIn, status: "undone", attendedAt: null }
          : { ...currentCheckIn, status: "registered", attendedAt: new Date() }
      })
    }, 1_500)

    return () => {
      clearTimeout(saveTimeout)
    }
  }, [checkIn.status])

  return (
    <QrCodeCheckInFeedback
      attendance={scenario.attendance}
      checkIn={checkIn}
      onRegisterAttendance={() => {
        setCheckIn({ ...checkIn, status: "registering" })
      }}
      onUndoAttendance={() => {
        setCheckIn({ ...checkIn, status: "undoing" })
      }}
      onClose={onClose}
    />
  )
}
const selections = [{ id: "meal", name: "Mat", options: [{ id: "vegetarian", name: "Vegetar" }] }]

export default {
  title: "Admin/QR Code Check-In Feedback",
}

const scenarios: { label: string; props: PreviewProps }[] = [
  { label: "Ubetalt", props: {} },
  { label: "I køen", props: { attendeeOverrides: { registeredAt: null } } },
  {
    label: "Ikke fullført valg",
    props: { attendanceOverrides: { selections }, attendeeOverrides: { paymentChargedAt: new Date() } },
  },
  {
    label: "Fullført valg",
    props: {
      attendanceOverrides: { selections },
      attendeeOverrides: {
        selections: [{ selectionId: "meal", selectionName: "Mat", optionId: "vegetarian", optionName: "Vegetar" }],
      },
    },
  },
  { label: "Allerede registrert", props: { status: "already-attended" } },
  { label: "Deltaker ikke funnet", props: { attendanceOverrides: { attendees: [] } } },
  { label: "Lagrer", props: { status: "registering" } },
  { label: "Registrering feilet", props: { status: "registration-failed" } },
  { label: "Angring feilet", props: { status: "undo-failed" } },
]

export const AllStates = () => {
  const [selectedScenario, setSelectedScenario] = useState<(typeof scenarios)[number] | null>(null)
  const [previewVersion, setPreviewVersion] = useState(0)

  return (
    <>
      <div className="grid max-w-lg grid-cols-2 gap-2">
        {scenarios.map((scenario) => {
          return (
            <Button
              key={scenario.label}
              type="button"
              onClick={() => {
                setSelectedScenario(scenario)
                setPreviewVersion((version) => version + 1)
              }}
            >
              {scenario.label}
            </Button>
          )
        })}
      </div>
      {selectedScenario !== null && (
        <Preview
          key={previewVersion}
          {...selectedScenario.props}
          onClose={() => {
            setSelectedScenario(null)
          }}
        />
      )}
    </>
  )
}

export const AutomaticCheckIn = () => {
  const [attendance, setAttendance] = useState(() => {
    const attendees = [
      createMockAttendee(),
      createMockAttendee({
        id: "00000000-0000-4000-8000-000000000031",
        user: { ...createMockAttendee().user, name: "Kari Nordmann" },
      }),
    ]

    return createMockAttendance({ attendancePrice: null, attendees })
  })
  const { checkIn, scanAttendee, registerAttendance, undoAttendance, closeCheckIn } = useQrCodeCheckIn({
    attendance,
    onUpdateAttendance: async (attendeeId, attendedAt) => {
      setAttendance((currentAttendance) => {
        const attendees = currentAttendance.attendees.map((attendee) => {
          return attendee.id === attendeeId ? { ...attendee, attendedAt } : attendee
        })

        return { ...currentAttendance, attendees }
      })
    },
  })

  return (
    <>
      {attendance.attendees.map((attendee) => {
        return (
          <Button
            key={attendee.id}
            onClick={() => {
              scanAttendee(attendee.id)
            }}
          >
            Skann {attendee.user.name}
          </Button>
        )
      })}
      {checkIn !== null && (
        <QrCodeCheckInFeedback
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
