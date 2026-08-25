import type { Attendance, Attendee } from "@dotkomonline/rpc/attendance"
import { Text } from "@dotkomonline/ui"
import {
  createAttendanceWithPaymentCountdown,
  createLockedDeregisterAttendance,
  createMockAttendance,
  createMockAttendee,
  createMockUser,
} from "../../../../.ladle/fixtures/attendance"
import { AttendanceStatus } from "./AttendanceStatus"

export default {
  title: "Attendance Status",
  component: AttendanceStatus,
}

const sizeOptions = [
  { size: "sm", label: "Small" },
  { size: "default", label: "Default" },
  { size: "lg", label: "Large" },
] as const

interface StateShowcaseProps {
  label: string
  withCapacityAttendance: Attendance
  withCapacityAttendee: Attendee | null
  withoutCapacityAttendance: Attendance
  withoutCapacityAttendee: Attendee | null
  eventEndInPast: boolean
}

const StateShowcase = ({
  label,
  withCapacityAttendance,
  withCapacityAttendee,
  withoutCapacityAttendance,
  withoutCapacityAttendee,
  eventEndInPast,
}: StateShowcaseProps) => (
  <div className="flex flex-col gap-3">
    <Text className="text-sm text-muted-foreground">{label}</Text>

    {sizeOptions.map((sizeOption) => (
      <div key={sizeOption.size} className="flex flex-row items-start gap-4">
        <Text className="text-xs text-muted-foreground w-16 shrink-0 pt-1">{sizeOption.label}</Text>

        <div className="flex flex-col gap-2">
          <AttendanceStatus
            attendance={withCapacityAttendance}
            attendee={withCapacityAttendee}
            eventEndInPast={eventEndInPast}
            size={sizeOption.size}
          />

          <AttendanceStatus
            attendance={withoutCapacityAttendance}
            attendee={withoutCapacityAttendee}
            eventEndInPast={eventEndInPast}
            size={sizeOption.size}
          />
        </div>
      </div>
    ))}
  </div>
)

export const AllStates = () => {
  const user = createMockUser()
  const reservedAttendee = createMockAttendee({ user, reserved: true })
  const waitlistAttendee = createMockAttendee({ user, reserved: false })

  const { attendance: lockedAttendance, attendee: lockedAttendee } = createLockedDeregisterAttendance()

  const paymentAttendance = createAttendanceWithPaymentCountdown()
  const paymentAttendee = paymentAttendance.attendees[0] ?? null

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <StateShowcase
        label="Open"
        withCapacityAttendance={createMockAttendance({ status: "OPEN" })}
        withCapacityAttendee={null}
        withoutCapacityAttendance={createMockAttendance({ capacity: 0, status: "OPEN" })}
        withoutCapacityAttendee={null}
        eventEndInPast={false}
      />

      <StateShowcase
        label="Not opened"
        withCapacityAttendance={createMockAttendance({ status: "NOT_OPENED" })}
        withCapacityAttendee={null}
        withoutCapacityAttendance={createMockAttendance({ capacity: 0, status: "NOT_OPENED" })}
        withoutCapacityAttendee={null}
        eventEndInPast={false}
      />

      <StateShowcase
        label="Closed"
        withCapacityAttendance={createMockAttendance({ status: "CLOSED" })}
        withCapacityAttendee={null}
        withoutCapacityAttendance={createMockAttendance({ capacity: 0, status: "CLOSED" })}
        withoutCapacityAttendee={null}
        eventEndInPast={false}
      />

      <StateShowcase
        label="Reserved attendee"
        withCapacityAttendance={createMockAttendance({ attendees: [reservedAttendee] })}
        withCapacityAttendee={reservedAttendee}
        withoutCapacityAttendance={createMockAttendance({ capacity: 0, attendees: [reservedAttendee] })}
        withoutCapacityAttendee={reservedAttendee}
        eventEndInPast={false}
      />

      <StateShowcase
        label="Waitlist attendee"
        withCapacityAttendance={createMockAttendance({ attendees: [waitlistAttendee] })}
        withCapacityAttendee={waitlistAttendee}
        withoutCapacityAttendance={createMockAttendance({ capacity: 0, attendees: [waitlistAttendee] })}
        withoutCapacityAttendee={waitlistAttendee}
        eventEndInPast={false}
      />

      <StateShowcase
        label="After deregister deadline"
        withCapacityAttendance={lockedAttendance}
        withCapacityAttendee={lockedAttendee}
        withoutCapacityAttendance={createMockAttendance({ capacity: 0, attendees: [lockedAttendee] })}
        withoutCapacityAttendee={lockedAttendee}
        eventEndInPast={false}
      />

      <StateShowcase
        label="Payment countdown"
        withCapacityAttendance={paymentAttendance}
        withCapacityAttendee={paymentAttendee}
        withoutCapacityAttendance={createMockAttendance({ capacity: 0, attendees: [paymentAttendee] })}
        withoutCapacityAttendee={paymentAttendee}
        eventEndInPast={false}
      />

      <StateShowcase
        label="Past event"
        withCapacityAttendance={createMockAttendance({ status: "OPEN" })}
        withCapacityAttendee={null}
        withoutCapacityAttendance={createMockAttendance({ capacity: 0, status: "OPEN" })}
        withoutCapacityAttendee={null}
        eventEndInPast={true}
      />
    </div>
  )
}
