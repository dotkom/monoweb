import type { Attendance } from "@dotkomonline/types"
import type { FC } from "react"
import { formatDate } from "@dotkomonline/utils"
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

  let text = ""

  switch (structuredDateInfo.status) {
    case "NOT_OPENED": {
      text = formatDate(structuredDateInfo.timeUtilOpen)
      break
    }
    case "OPEN": {
      text = formatDate(structuredDateInfo.timeUntilClose)
      break
    }
    case "CLOSED": {
      text = formatDate(structuredDateInfo.timeElapsedSinceClose)
      break
    }
    default:
      throw new Error("Unknown status")
  }

  const background = STATUS_STATE_COLOR[status]

  return (
    <div className="mb-4">
      <div className={`block rounded-lg ${background} p-4 shadow-lg`}>
        <p className="text-lg font-bold">{title}</p>
        {p(text)}
      </div>
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
