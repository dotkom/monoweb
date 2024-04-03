import { Attendance } from "@dotkomonline/types"
import { FC } from "react"
import { dateToString, getStructuredDateInfo } from "../utils"

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
      const { value, isRelative } = dateToString(structuredDateInfo.timeUtilOpen)
      text = isRelative ? `Åpner om <strong>${value}</strong>` : `Åpner <strong>${value}</strong>`
      break
    }
    case "OPEN": {
      const { value, isRelative } = dateToString(structuredDateInfo.timeUntilClose)
      text = isRelative ? `Stenger om <strong>${value}</strong>` : `Stenger <strong>${value}</strong>`
      break
    }
    case "CLOSED": {
      const { value, isRelative } = dateToString(structuredDateInfo.timeElapsedSinceClose)
      text = isRelative ? `Stengte for <strong>${value}</strong> siden` : `Stengte <strong>${value}</strong>`
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
