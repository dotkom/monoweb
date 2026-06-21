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

export const AllStates = () => {
  const user = createMockUser()
  const reservedAttendee = createMockAttendee({ user, reserved: true })
  const waitlistAttendee = createMockAttendee({ user, reserved: false })

  const { attendance: lockedAttendance, attendee: lockedAttendee } = createLockedDeregisterAttendance()

  const paymentAttendance = createAttendanceWithPaymentCountdown()
  const paymentAttendee = paymentAttendance.attendees[0]

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Open</Text>

        <AttendanceStatus
          attendance={createMockAttendance({ status: "OPEN" })}
          attendee={null}
          eventEndInPast={false}
        />

        <AttendanceStatus
          attendance={createMockAttendance({ capacity: 0, status: "OPEN" })}
          attendee={null}
          eventEndInPast={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Not opened</Text>

        <AttendanceStatus
          attendance={createMockAttendance({ status: "NOT_OPENED" })}
          attendee={null}
          eventEndInPast={false}
        />

        <AttendanceStatus
          attendance={createMockAttendance({ capacity: 0, status: "NOT_OPENED" })}
          attendee={null}
          eventEndInPast={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Closed</Text>

        <AttendanceStatus
          attendance={createMockAttendance({ status: "CLOSED" })}
          attendee={null}
          eventEndInPast={false}
        />

        <AttendanceStatus
          attendance={createMockAttendance({ capacity: 0, status: "CLOSED" })}
          attendee={null}
          eventEndInPast={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Reserved attendee</Text>

        <AttendanceStatus
          attendance={createMockAttendance({ attendees: [reservedAttendee] })}
          attendee={reservedAttendee}
          eventEndInPast={false}
        />

        <AttendanceStatus
          attendance={createMockAttendance({ capacity: 0, attendees: [reservedAttendee] })}
          attendee={reservedAttendee}
          eventEndInPast={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Waitlist attendee</Text>

        <AttendanceStatus
          attendance={createMockAttendance({ attendees: [waitlistAttendee] })}
          attendee={waitlistAttendee}
          eventEndInPast={false}
        />

        <AttendanceStatus
          attendance={createMockAttendance({ capacity: 0, attendees: [waitlistAttendee] })}
          attendee={waitlistAttendee}
          eventEndInPast={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">After deregister deadline</Text>

        <AttendanceStatus attendance={lockedAttendance} attendee={lockedAttendee} eventEndInPast={false} />

        <AttendanceStatus
          attendance={createMockAttendance({ capacity: 0, attendees: [lockedAttendee] })}
          attendee={lockedAttendee}
          eventEndInPast={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Payment countdown</Text>

        <AttendanceStatus attendance={paymentAttendance} attendee={paymentAttendee} eventEndInPast={false} />

        <AttendanceStatus
          attendance={createMockAttendance({ capacity: 0, attendees: [paymentAttendee] })}
          attendee={paymentAttendee}
          eventEndInPast={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Past event</Text>

        <AttendanceStatus attendance={createMockAttendance({ status: "OPEN" })} attendee={null} eventEndInPast={true} />

        <AttendanceStatus
          attendance={createMockAttendance({ capacity: 0, status: "OPEN" })}
          attendee={null}
          eventEndInPast={true}
        />
      </div>
    </div>
  )
}
