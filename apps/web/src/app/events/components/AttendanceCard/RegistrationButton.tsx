import type { Attendance, AttendancePool, Attendee } from "@dotkomonline/types"
import { Button, Icon } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import type { FC, ReactElement } from "react"
import { getAttendanceStatus } from "../../utils"

interface Props {
  attendee: Attendee | null
  attendance: Attendance
  attendancePool: AttendancePool | null
  registerForAttendance: () => void
  unregisterForAttendance: () => void
}

const nowWithOffset = (offset: number) => new Date(Date.now() + offset)

export const RegistrationButton: FC<Props> = ({
  attendee,
  attendance,
  attendancePool,
  registerForAttendance,
  unregisterForAttendance,
}) => {
  const attendanceStatus = getAttendanceStatus(attendance)

  let changeRegisteredStateButton: ReactElement<typeof Button>
  let eventAttendanceStatusText: string

  switch (attendanceStatus.status) {
    case "NOT_OPENED": {
      eventAttendanceStatusText = `Åpner ${formatDate(nowWithOffset(attendanceStatus.timeUntilOpen))}`
      break
    }
    case "OPEN": {
      eventAttendanceStatusText = `Stenger ${formatDate(nowWithOffset(attendanceStatus.timeUntilClose))}`
      break
    }
    case "CLOSED": {
      eventAttendanceStatusText = `Stengte ${formatDate(nowWithOffset(attendanceStatus.timeSinceClose))}`
      break
    }
    default:
      throw new Error("Unknown status")
  }

  const background = attendancePool ? "bg-green-9" : "bg-slate-8"

  if (attendee) {
    changeRegisteredStateButton = (
      <Button className="w-full text-white rounded-lg" color="red" variant="solid" onClick={unregisterForAttendance}>
        Meld meg av
      </Button>
    )
  } else {
    changeRegisteredStateButton = (
      <Button
        className={clsx("w-full text-white rounded-lg h-fit p-2 text-left disabled:opacity-100", background)}
        onClick={registerForAttendance}
        disabled={attendanceStatus.status !== "OPEN" || !attendancePool}
        icon={<Icon icon="tabler:plus" className="text-3xl" />}
      >
        <span className="flex flex-col items-center w-max">
          <span className="block uppercase">Meld meg på</span>
          <span className="block font-medium text-xs">{eventAttendanceStatusText}</span>
        </span>
      </Button>
    )
  }

  return changeRegisteredStateButton
}
