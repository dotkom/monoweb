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
  isLoading: boolean
}

const nowWithOffset = (offset: number) => new Date(Date.now() + offset)

export const RegistrationButton: FC<Props> = ({
  attendee,
  attendance,
  attendancePool,
  registerForAttendance,
  unregisterForAttendance,
  isLoading,
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

  const buttonStatusText = attendee ? "Meld meg av" : "Meld meg på"
  const buttonIcon = null

  return (
    <Button
      className={clsx("w-full text-white rounded-lg h-fit p-2 text-left disabled:opacity-100")}
      onClick={attendee ? unregisterForAttendance : registerForAttendance}
      disabled={attendanceDetails.status !== "Open" || !attendancePool}
      color={attendee ? "red" : "green"}
      variant="solid"
      icon={buttonIcon}
    >
      {
        <span className="flex flex-col items-center w-max">
          {isLoading ? (
            <Icon icon="tabler:loader-2" className="animate-spin text-2xl py-2" />
          ) : (
            <>
              <span className="block uppercase">{buttonStatusText}</span>
              <span className="block font-medium text-xs">{eventAttendanceStatusText}</span>
            </>
          )}
        </span>
      }
    </Button>
  )
}
