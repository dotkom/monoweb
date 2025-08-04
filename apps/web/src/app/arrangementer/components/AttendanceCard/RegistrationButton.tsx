import type { Attendance, AttendancePool, AttendanceStatus, Attendee, Punishment } from "@dotkomonline/types"
import { Button, Icon, Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn } from "@dotkomonline/ui"
import type { FC } from "react"

const getButtonColor = (disabled: boolean, attendee: boolean, isPoolFull: boolean, hasPunishment: boolean) => {
  if (disabled) return "bg-gray-200 dark:bg-stone-800 disabled:hover:bg-gray-200 dark:disabled:hover:bg-stone-800"
  if (attendee) return "bg-red-300 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
  if (isPoolFull || hasPunishment)
    return "bg-yellow-200 hover:bg-yellow-100 dark:bg-yellow-800 dark:hover:bg-yellow-700"

  return "bg-green-300 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
}

const getDisabledText = (
  status: AttendanceStatus,
  attendee: boolean,
  pool: boolean,
  isPastDeregisterDeadline: boolean,
  isLoggedIn: boolean,
  hasMembership?: boolean,
  isSuspended?: boolean
) => {
  if (!isLoggedIn) return "Du må være innlogget for å melde deg på"
  if (!hasMembership) return "Du må ha registrert medlemskap for å melde deg på"
  if (status === "NotOpened") return "Påmeldinger har ikke åpnet"
  if (status === "Closed" && !attendee) return "Påmeldingen er stengt"
  if (!pool && !attendee) return "Du har ingen påmeldingsgruppe"
  if (isPastDeregisterDeadline && attendee) return "Avmeldingsfristen har utløpt"
  if (isSuspended) return "Du er suspendert fra Online"

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
  punishment?: Punishment | null
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
  punishment,
}) => {
  const isPastDeregisterDeadline = new Date() > attendance.deregisterDeadline
  const isPoolFull = pool ? pool.numAttendees >= pool.capacity : false
  const isSuspended = punishment?.suspended ?? false
  const hasPunishment = punishment ? punishment.delay > 0 || isSuspended : false

  const buttonText = attendee ? "Meld meg av" : "Meld meg på"
  const buttonIcon = null

  const disabledText = getDisabledText(
    status,
    Boolean(attendee),
    Boolean(pool),
    isPastDeregisterDeadline,
    isLoggedIn,
    hasMembership,
    isSuspended
  )
  const disabled = Boolean(disabledText)

  const buttonContent = isLoading ? (
    <Icon icon="tabler:loader-2" className="animate-spin text-2xl py-2" />
  ) : (
    <div
      className={cn(
        "flex flex-row gap-2 items-center",
        disabled ? "text-gray-800 dark:text-stone-400" : "text-black dark:text-white"
      )}
    >
      <Icon className="text-lg" icon={`tabler:${disabled ? "lock" : attendee ? "user-minus" : "user-plus"}`} />
      <Text className="font-medium">{buttonText}</Text>
    </div>
  )

  const registrationButton = (
    <Button
      onClick={attendee ? unregisterForAttendance : registerForAttendance}
      disabled={disabled}
      icon={buttonIcon}
      className={cn(
        "rounded-lg h-fit min-h-[4rem] flex-col gap-1",
        getButtonColor(disabled, Boolean(attendee), isPoolFull, hasPunishment)
      )}
    >
      {buttonContent}
    </Button>
  )

  if (disabled) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{registrationButton}</TooltipTrigger>
          <TooltipContent sideOffset={-10}>
            <Text>{disabledText}</Text>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return registrationButton
}
