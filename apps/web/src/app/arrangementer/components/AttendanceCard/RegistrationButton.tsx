import type { Attendance, AttendancePool, AttendanceStatus, Attendee } from "@dotkomonline/types"
import { Button, Icon, Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn } from "@dotkomonline/ui"
import type { FC } from "react"

const getButtonColor = (disabled: boolean, attendee: boolean, isPoolFull: boolean) => {
  if (disabled) return "bg-slate-200 dark:bg-stone-700 disabled:hover:bg-slate-200 dark:disabled:hover:bg-stone-700"
  if (attendee) return "bg-red-400 hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700"
  if (isPoolFull) return "bg-yellow-400 hover:bg-yellow-300 dark:bg-yellow-800 dark:hover:bg-yellow-700"

  return "bg-green-400 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700"
}

const getDisabledText = (
  status: AttendanceStatus,
  attendee: boolean,
  pool: boolean,
  isPastDeregisterDeadline: boolean,
  isLoggedIn: boolean,
  hasMembership?: boolean
) => {
  if (!isLoggedIn) return "Du må være innlogget for å melde deg på"
  if (!hasMembership) return "Du må ha registrert medlemskap for å melde deg på"
  if (status === "NotOpened") return "Påmeldinger har ikke åpnet"
  if (status === "Closed" && !attendee) return "Påmeldingen er stengt"
  if (!pool && !attendee) return "Du har ingen påmeldingsgruppe"
  if (isPastDeregisterDeadline && attendee) return "Avmeldingsfristen har utløpt"

  return null
}

interface Props {
  attendance: Attendance
  attendee: Attendee | undefined | null
  registerForAttendance: () => void
  unregisterForAttendance: () => void
  pool: AttendancePool | undefined | null
  isLoading: boolean
  isLoggedIn: boolean
  hasMembership?: boolean
  status: AttendanceStatus
}

export const RegistrationButton: FC<Props> = ({
  attendee,
  attendance,
  registerForAttendance,
  unregisterForAttendance,
  pool,
  isLoading,
  isLoggedIn,
  hasMembership,
  status,
}) => {
  const buttonText = attendee ? "Meld meg av" : "Meld meg på"
  const buttonIcon = null

  const isPastDeregisterDeadline = new Date() > attendance.deregisterDeadline
  const isPoolFull = pool ? pool.numAttendees >= pool.capacity : false

  const disabledText = getDisabledText(
    status,
    Boolean(attendee),
    Boolean(pool),
    isPastDeregisterDeadline,
    isLoggedIn,
    hasMembership
  )
  const disabled = Boolean(disabledText)

  const className = cn("rounded-lg h-fit min-h-[4rem] p-2", getButtonColor(disabled, Boolean(attendee), isPoolFull))

  const buttonContent = isLoading ? (
    <Icon icon="tabler:loader-2" className="animate-spin text-2xl py-2" />
  ) : (
    <div className={cn("flex flex-row gap-2 items-center", disabled ? "text-slate-800 dark:text-stone-400" : "text-black dark:text-white")}>
      <Icon className="text-lg" icon={`tabler:${disabled ? "lock" : attendee ? "user-minus" : "user-plus"}`} />
      <Text className="font-medium">{buttonText}</Text>
    </div>
  )

  const registrationButton = (
    <Button
      className={className}
      onClick={attendee ? unregisterForAttendance : registerForAttendance}
      disabled={disabled}
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
        <TooltipTrigger asChild>{registrationButton}</TooltipTrigger>
        <TooltipContent sideOffset={-10}>
          <Text>{disabledText}</Text>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
