import type { Attendance, Attendee } from "@dotkomonline/types"
import { Button, Icon } from "@dotkomonline/ui"
import clsx from "clsx"
import type { FC } from "react"

interface Props {
  attendance: Attendance
  attendee: Attendee | undefined | null
  registerForAttendance: () => void
  unregisterForAttendance: () => void
  isLoading: boolean
  status: "NotOpened" | "Open" | "Closed" | "Full"
}

export const RegistrationButton: FC<Props> = ({
  attendee,
  attendance,
  registerForAttendance,
  unregisterForAttendance,
  isLoading,
  status,
}) => {
  const buttonStatusText = attendee ? "Meld meg av" : "Meld meg på"
  const buttonIcon = null

  const isPastDeregisterDeadline = new Date() > attendance.deregisterDeadline
  const isClosedWithoutAttendee = status === "Closed" && !attendee
  const disabled = status === "NotOpened" || isClosedWithoutAttendee || isPastDeregisterDeadline || isLoading

  const className = clsx(
    "w-full text-black rounded-lg h-fit min-h-[4rem] p-2 text-left disabled:opacity-100",
    disabled ? "bg-slate-4 text-slate-8" : attendee ? "bg-red-8 hover:bg-red-9" : "bg-green-8 hover:bg-green-9"
  )

  return (
    <Button
      className={className}
      onClick={attendee ? unregisterForAttendance : registerForAttendance}
      disabled={disabled}
      variant="solid"
      icon={buttonIcon}
    >
      {isLoading ? (
        <Icon icon="tabler:loader-2" className="animate-spin text-2xl py-2" />
      ) : (
        <>
          <Icon className="text-lg" icon={`tabler:${disabled ? "lock-plus" : attendee ? "user-minus" : "user-plus"}`} />
          {buttonStatusText}
        </>
      )}
    </Button>
  )
}
