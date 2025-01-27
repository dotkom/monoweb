import type { Attendance, AttendancePool, Attendee } from "@dotkomonline/types"
import { Button, Icon } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import type { FC } from "react"

interface Props {
  attendance: Attendance
  attendee: Attendee | null
  attendablePool: AttendancePool | null
  registerForAttendance: () => void
  unregisterForAttendance: () => void
  isLoading: boolean
}

export const RegistrationButton: FC<Props> = ({
  attendee,
  attendance,
  attendablePool,
  registerForAttendance,
  unregisterForAttendance,
  isLoading,
}) => {
  const now = new Date()

  let eventAttendanceStatusText: string

  if (now < attendance.registerStart) {
    eventAttendanceStatusText = `Åpner ${formatDate(attendance.registerStart)}`
  } else if (now > attendance.registerEnd) {
    eventAttendanceStatusText = `Stenger ${formatDate(attendance.registerEnd)}`
  } else {
    eventAttendanceStatusText = `Stengte ${formatDate(attendance.registerEnd)}`
  }

  const canRegisterToEvent = now >= attendance.registerStart && now <= attendance.registerEnd && Boolean(attendablePool)
  const canDeregisterToEvent = attendee && now < attendance.deregisterDeadline
  const buttonStatusText = canDeregisterToEvent ? "Meld meg av" : canRegisterToEvent ? "Meld meg på" : "Ingen påmelding"
  const buttonIcon = null

  const color = canRegisterToEvent ? "green" : canDeregisterToEvent ? "red" : "slate"

  return (
    <Button
      className={clsx("w-full text-white rounded-lg h-fit p-2 text-left disabled:opacity-100")}
      onClick={attendee ? unregisterForAttendance : registerForAttendance}
      disabled={!enabled}
      color={color}
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
