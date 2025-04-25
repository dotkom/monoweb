import type { Attendance, AttendancePool, AttendanceStatus, Attendee } from "@dotkomonline/types"
import { Button, Icon, Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@dotkomonline/ui"
import clsx from "clsx"
import type { FC } from "react"

const getButtonColor = (disabled: boolean, attendee: boolean, isPoolFull: boolean) => {
  switch (true) {
    case disabled:
      return "bg-slate-3 text-slate-8"
    case attendee:
      return "bg-red-7 hover:bg-red-8"
    case isPoolFull:
      return "bg-yellow-5 hover:bg-yellow-6"
    default:
      return "bg-green-7 hover:bg-green-8"
  }
}

const getDisabledText = (status: AttendanceStatus, attendee: boolean, pool: boolean, isPastDeregisterDeadline: boolean) => {
  switch (true) {
    case status === "NotOpened":
      return "Påmeldinger har ikke åpnet"
    case status === "Closed" && !attendee:
      return "Påmeldingen er stengt"
    case !pool && !attendee:
      return "Du har ingen påmeldingsgruppe"
    case status === "Closed" && isPastDeregisterDeadline && !attendee:
      return "Avmeldingsfristen har utløpt"
    default:
      return null
  }
}

interface Props {
  attendance: Attendance
  attendee: Attendee | undefined | null
  registerForAttendance: () => void
  unregisterForAttendance: () => void
  pool: AttendancePool | undefined | null
  isLoading: boolean
  status: AttendanceStatus
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
  const isPoolFull = pool ? pool.numAttendees >= pool.capacity : false

  const disabledText = getDisabledText(status, Boolean(attendee), Boolean(pool), isPastDeregisterDeadline)
  const disabled = Boolean(disabledText)

  const className = clsx(
    "flex flex-row gap-2 items-center w-full text-black rounded-lg h-fit min-h-[4rem] p-2 text-left opacity-100 disabled:opacity-100",
    getButtonColor(disabled, Boolean(attendee), isPoolFull)
  )

  const buttonContent = isLoading ? (
    <Icon icon="tabler:loader-2" className="animate-spin text-2xl py-2" />
  ) : (
    <div className={clsx("flex flex-row gap-2 items-center", disabled ? "text-slate-9" : "text-slate-12")}>
      <Icon className="text-lg" icon={`tabler:${disabled ? "lock" : attendee ? "user-minus" : "user-plus"}`} />
      <Text className="font-medium">{buttonText}</Text>
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
      <Text className="font-medium">{buttonContent}</Text>
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
          className="border-none text-center bg-slate-1 p-2 transition-colors duration-300 max-w-80 min-w-60 w-full"
          sideOffset={-10}
        >
          <Text className="font-medium">{disabledText}</Text>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
