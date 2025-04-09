import type { Attendance, AttendancePool, Attendee } from "@dotkomonline/types"
import { Button, Icon, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@dotkomonline/ui"
import clsx from "clsx"
import type { FC } from "react"

interface Props {
  attendance: Attendance
  attendee: Attendee | undefined | null
  registerForAttendance: () => void
  unregisterForAttendance: () => void
  pool: AttendancePool | undefined | null
  isLoading: boolean
  status: "NotOpened" | "Open" | "Closed" | "Full"
}

export const RegistrationButton: FC<Props> = ({
  attendee,
  attendance,
  registerForAttendance,
  unregisterForAttendance,
  pool,
  isLoading,
  status,
}) => {
  const buttonText = attendee ? "Meld meg av" : "Meld meg på"
  const buttonIcon = null

  const isPastDeregisterDeadline = new Date() > attendance.deregisterDeadline

  let disabledText = null

  if (status === "NotOpened") {
    disabledText = "Påmeldinger har ikke åpnet"
  } else if (status === "Closed" && !attendee) {
    disabledText = "Påmeldingen er stengt"
  } else if (!pool && !attendee) {
    disabledText = "Du har ingen påmeldingsgruppe"
  } else if (isPastDeregisterDeadline && !attendee) {
    disabledText = "Avmeldingsfristen har utløpt"
  }

  const disabled = Boolean(disabledText)

  const className = clsx(
    "flex flex-row gap-2 items-center w-full text-black rounded-lg h-fit min-h-[4rem] p-2 text-left disabled:opacity-100",
    disabled ? "bg-slate-4 text-slate-8" : attendee ? "bg-red-8 hover:bg-red-9" : "bg-green-8 hover:bg-green-9"
  )

  const buttonContent = isLoading ? (
    <Icon icon="tabler:loader-2" className="animate-spin text-2xl py-2" />
  ) : (
    <div className="flex flex-row gap-2 items-center text-slate-9">
      <Icon className="text-lg" icon={`tabler:${disabled ? "lock" : attendee ? "user-minus" : "user-plus"}`} />
      <p>{buttonText}</p>
    </div>
  )

  const registrationButton = (
    <Button
      className={className}
      onClick={attendee ? unregisterForAttendance : registerForAttendance}
      disabled={disabled}
      variant="solid"
      icon={buttonIcon}
    >
      {buttonContent}
    </Button>
  )

  if (!disabledText) {
    return registrationButton
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* This div is needed to make the tooltip work with the button since it is disabled */}
          <div>{registrationButton}</div>
        </TooltipTrigger>
        <TooltipContent
          className="border-none bg-slate-1 p-2 transition-colors duration-300 max-w-80 min-w-60 w-full"
          sideOffset={-10}
        >
          {disabledText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
