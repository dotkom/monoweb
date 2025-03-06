import type { Attendance, Attendee } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import type { ComponentProps, FC } from "react"

interface Props {
  attendance: Attendance
  attendee: Attendee | null
  registerForAttendance: () => void
  deregisterForAttendance: () => void
  isLoading: boolean
}

export const RegistrationButton: FC<Props> = ({
  attendee,
  attendance: { registerStart, registerEnd, deregisterDeadline },
  registerForAttendance,
  deregisterForAttendance,
  isLoading,
}) => {
  const now = new Date()

  if (attendee) {
    if (deregisterDeadline > now) {
      return (
        <GenericRegistrationButton
          loading={isLoading}
          actionText="Meld meg av"
          infoText={`Avmeldingsfrist ${formatDate(deregisterDeadline)}`}
          color="red"
          onClick={deregisterForAttendance}
        />
      )
    }
    return (
      <GenericRegistrationButton
        loading={isLoading}
        actionText="Meld meg av"
        infoText="Avmeldingsfristen er ute"
        disabled
        color="slate"
      />
    )
  }

  if (registerStart < now) {
    if (registerEnd > now) {
      return (
        <GenericRegistrationButton
          loading={isLoading}
          actionText="Meld meg på"
          infoText={`Stenger ${formatDate(registerEnd, { includeTime: true })}`}
          color="green"
          onClick={registerForAttendance}
        />
      )
    }

    return (
      <GenericRegistrationButton
        loading={isLoading}
        actionText="Meld meg på"
        infoText={`Stengte ${formatDate(registerEnd)}`}
        color="slate"
        disabled
      />
    )
  }

  return (
    <GenericRegistrationButton
      loading={isLoading}
      actionText="Meld meg på"
      infoText={`Åpner ${formatDate(registerStart)}`}
      color="slate"
      disabled
    />
  )
}

function GenericRegistrationButton({
  loading,
  actionText,
  infoText,
  ...props
}: ComponentProps<typeof Button> & { actionText: string; infoText: string }) {
  return (
    <Button
      className={clsx("w-full text-white rounded-lg h-fit p-2 text-left disabled:opacity-100")}
      variant="solid"
      loading={loading}
      {...props}
    >
      {
        <span className={clsx("flex flex-col items-center w-max", loading ? "invisible" : "visible")}>
          <>
            <span className="block uppercase">{actionText}</span>
            <span className="block font-medium text-xs">{infoText}</span>
          </>
        </span>
      }
    </Button>
  )
}
