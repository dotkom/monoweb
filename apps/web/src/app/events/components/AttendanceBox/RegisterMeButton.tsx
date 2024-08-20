import type { Attendance, Attendee } from "@dotkomonline/types"
import { Button, Icon } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import type { FC, ReactElement } from "react"
import { getStructuredDateInfo } from "../../utils"

interface Props {
  attendee: Attendee | null
  attendance: Attendance
  hasAttendancePool: boolean
  registerForAttendance: () => void
  unregisterForAttendance: () => void
}

export const RegisterMeButton: FC<Props> = ({
  attendee,
  attendance,
  hasAttendancePool,
  registerForAttendance,
  unregisterForAttendance,
}) => {
  const structuredDateInfo = getStructuredDateInfo(attendance, new Date())

  let changeRegisteredStateButton: ReactElement<typeof Button>
  let eventAttendanceStatusText: string

  switch (structuredDateInfo.status) {
    case "NOT_OPENED": {
      eventAttendanceStatusText = `Åpner ${formatDate(
        new Date(Date.now() + structuredDateInfo.timeUtilOpen.getTime())
      )}`
      break
    }
    case "OPEN": {
      eventAttendanceStatusText = `Stenger ${formatDate(
        new Date(Date.now() + structuredDateInfo.timeUntilClose.getTime())
      )}`
      break
    }
    case "CLOSED": {
      eventAttendanceStatusText = `Stengte ${formatDate(
        new Date(Date.now() + structuredDateInfo.timeElapsedSinceClose.getTime())
      )}`
      break
    }
    default:
      throw new Error("Unknown status")
  }

  const background = hasAttendancePool ? "bg-green-9" : "bg-slate-8"

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
        disabled={!hasAttendancePool}
        icon={<Icon icon="tabler:plus" className="text-4xl" />}
      >
        <span className="flex flex-col gap-3 items-center w-max">
          <span className="block uppercase text-lg">Meld meg på</span>
          <span className="block font-medium text-sm">{eventAttendanceStatusText}</span>
        </span>
      </Button>
    )
  }

  return changeRegisteredStateButton
}
