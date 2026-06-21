import { addHours, subHours } from "date-fns"
import {
  createAttendanceWithPaymentCountdown,
  createAttendanceWithReservedUser,
  createMockAttendance,
} from "../../../../../.ladle/fixtures/attendance"
import { AttendanceDateInfo } from "./AttendanceDateInfo"
import { Text } from "@dotkomonline/ui"

export default {
  title: "Attendance Card/Attendance Date Info",
  component: AttendanceDateInfo,
}

export const AllStates = () => {
  const paymentAttendance = createAttendanceWithPaymentCountdown()
  const paymentAttendee = paymentAttendance.attendees[0]
  const reservedAttendance = createAttendanceWithReservedUser()
  const reservedAttendee = reservedAttendance.attendees[0]

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">event open</Text>

        <AttendanceDateInfo
          attendance={createMockAttendance({ status: "OPEN", attendancePrice: null })}
          attendee={null}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Paid event open</Text>

        <AttendanceDateInfo
          attendance={createMockAttendance({ status: "OPEN", attendancePrice: 100 })}
          attendee={null}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Not opened yet</Text>

        <AttendanceDateInfo
          attendance={createMockAttendance({ status: "NOT_OPENED", attendancePrice: 100 })}
          attendee={null}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Closed</Text>

        <AttendanceDateInfo
          attendance={createMockAttendance({ status: "CLOSED", attendancePrice: 100 })}
          attendee={null}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Paid with charge schedule notice</Text>

        <AttendanceDateInfo
          attendance={paymentAttendance}
          attendee={paymentAttendee}
          chargeScheduleDate={subHours(paymentAttendance.deregisterDeadline, 12)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Reserved before charge</Text>

        <AttendanceDateInfo
          attendance={reservedAttendance}
          attendee={reservedAttendee}
          chargeScheduleDate={addHours(new Date(), 6)}
        />
      </div>
    </div>
  )
}
