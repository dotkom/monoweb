import type { Attendance, Attendee } from "@dotkomonline/types"
import { Button, Icon } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import type { FC } from "react"
import { getAttendanceDetails } from "../../utils"

interface Props {
  attendance: Attendance
  attendee: Attendee | undefined | null
  registerForAttendance: () => void
  unregisterForAttendance: () => void
  isLoading: boolean
  enabled: boolean | undefined
}

const nowWithOffset = (offset: number) => new Date(Date.now() + offset)

export const RegistrationButton: FC<Props> = ({
  attendee,
  attendance,
  registerForAttendance,
  unregisterForAttendance,
  isLoading,
  enabled,
}) => {
  const attendanceDetails = getAttendanceDetails(attendance)

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

  const isPastDeregisterDeadline = new Date() > attendance.deregisterDeadline

  const className = clsx(
    "w-full text-black rounded-lg h-fit min-h-[4rem] p-2 text-left disabled:opacity-100",
    attendanceDetails.status === "NotOpened" || isPastDeregisterDeadline ? "bg-slate-4 text-slate-8" : attendee ? "bg-red-5 hover:bg-red-6" : "bg-green-4 hover:bg-green-5",
  )

  return (
    <Button
      className={className}
      onClick={attendee ? unregisterForAttendance : registerForAttendance}
      disabled={!enabled}
      variant="solid"
      icon={buttonIcon}
    >
      <Icon className="text-lg" icon={`tabler:${attendanceDetails.status === "NotOpened" || isPastDeregisterDeadline ? "lock-plus" : attendee ? "user-minus" : "user-plus"}`} />
      {isLoading ? (
        <Icon icon="tabler:loader-2" className="animate-spin text-2xl py-2" />
      ) : (
        <>{buttonStatusText}</>
      )}
    </Button>
  )
}
