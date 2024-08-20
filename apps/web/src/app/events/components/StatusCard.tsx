import type { Attendance } from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import type { FC, ReactElement } from "react"
import { getStructuredDateInfo } from "../utils"

interface StatusCardProps {
  attendance: Attendance
}

type StatusState = "CLOSED" | "NOT_OPENED" | "OPEN"

const STATUS_STATE_COLOR: { [key in StatusState]: `bg-${string}-4` } = {
  NOT_OPENED: "bg-indigo-4",
  OPEN: "bg-green-4",
  CLOSED: "bg-red-4",
}

const STATUS_TEXTS: { [key in StatusState]: { title: string } } = {
  OPEN: { title: "Åpen" },
  NOT_OPENED: { title: "Ikke åpnet" },
  CLOSED: { title: "Stengt" },
}

// Biome ignores do not work in the middle of jsx so this is extracted just to igonre the rule here
//biome-ignore lint/security/noDangerouslySetInnerHtml: <We do not pass any user input into this, so it is safe>
const p = (text: string) => <p dangerouslySetInnerHTML={{ __html: text }} />

export const StatusCard: FC<StatusCardProps> = ({ attendance }) => {
  const status = calculateStatus({
    registerStart: attendance.registerStart,
    registerEnd: attendance.registerEnd,
    now: new Date(),
  })

  const structuredDateInfo = getStructuredDateInfo(attendance, new Date())

  const { title } = STATUS_TEXTS[status]

  let eventAttendanceStatusText: ReactElement<typeof p>

  switch (structuredDateInfo.status) {
    case "NOT_OPENED": {
      eventAttendanceStatusText = <p>Åpner {formatDate(structuredDateInfo.timeUtilOpen)}</p>
      break
    }
    case "OPEN": {
      eventAttendanceStatusText = <p>Stenger {formatDate(structuredDateInfo.timeUntilClose)}</p>
      break
    }
    case "CLOSED": {
      eventAttendanceStatusText = <p>Stengte {formatDate(structuredDateInfo.timeElapsedSinceClose)}</p>
      break
    }
    default:
      throw new Error("Unknown status")
  }

  const background = STATUS_STATE_COLOR[status]

  return (
    <div className={`block rounded-lg ${background} p-4 mb-4`}>
      <p className="text-lg font-bold">{title}</p>
      {eventAttendanceStatusText}
    </div>
  )
}

export const calculateStatus = ({
  registerStart,
  registerEnd,
  now,
}: {
  registerStart: Date
  registerEnd: Date
  now: Date
}): StatusState => {
  if (now < registerStart) {
    return "NOT_OPENED"
  }

  if (now > registerEnd) {
    return "CLOSED"
  }

  return "OPEN"
}
