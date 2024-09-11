import type { Attendance, AttendancePool, Attendee } from "@dotkomonline/types"
import { Button, Icon } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import type { FC, ReactElement } from "react"
import { getAttendanceDetails } from "../../utils"

interface Props {
  attendance: Attendance
  attendee: Attendee | null
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
  const attendanceDetails = getAttendanceDetails(attendance)

  let changeRegisteredStateButton: ReactElement<typeof Button>
  let eventAttendanceStatusText: string

  switch (attendanceDetails.status) {
    case "NotOpened": {
      eventAttendanceStatusText = `Åpner ${formatDate(nowWithOffset(attendanceDetails.timeUntilOpen))}`
      break
    }
    case "Open": {
      eventAttendanceStatusText = `Stenger ${formatDate(nowWithOffset(attendanceDetails.timeUntilClose))}`
      break
    }
    case "Closed": {
      eventAttendanceStatusText = `Stengte ${formatDate(nowWithOffset(attendanceDetails.timeSinceClose))}`
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
        disabled={attendanceDetails.status !== "Open" || !attendancePool}
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
