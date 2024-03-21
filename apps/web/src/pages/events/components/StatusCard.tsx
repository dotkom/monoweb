interface StatusCardProps {
  title: string
  text: string
  background: string
}

// Biome ignores do not work in the middle of jsx so this is extracted just to igonre the rule here
//biome-ignore lint/security/noDangerouslySetInnerHtml: <We do not pass any user input into this, so it is safe>
const p = (text: string) => <p dangerouslySetInnerHTML={{ __html: text }} />

export const StatusCard = ({ title, text, background }: StatusCardProps) => (
  <div className="mb-4">
    <div className={`block rounded-lg ${background} p-4 shadow-lg`}>
      <p className="text-lg font-bold">{title}</p>
      {p(text)}
    </div>
  </div>
)

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

export const getStatusCardData = (status: StatusState, datetime: Date): StatusCardProps => {
  const { title } = STATUS_TEXTS[status]

  return {
    title,
    text: getStatusDate(datetime, status),
    background: STATUS_STATE_COLOR[status],
  }
}

type StatusState = "CLOSED" | "NOT_OPENED" | "OPEN"

const STATUS_STATE_COLOR: { [key in StatusState]: `bg-${string}-4` } = {
  NOT_OPENED: "bg-red-4",
  OPEN: "bg-green-4",
  CLOSED: "bg-purple-4",
}

const STATUS_TEXTS: { [key in StatusState]: { title: string } } = {
  OPEN: { title: "Åpen" },
  NOT_OPENED: { title: "Ikke åpnet" },
  CLOSED: { title: "Stengt" },
}

interface DateString {
  value: string
  isRelative: boolean
}

// todo: move out of file
const dateToString = (attendanceOpeningDate: Date): DateString => {
  // todo: move out of scope
  const THREE_DAYS_MS = 259_200_000
  const ONE_DAY_MS = 86_400_000
  const ONE_HOUR_MS = 3_600_000
  const ONE_MINUTE_MS = 60_000
  const ONE_SECOND_MS = 1_000

  const now = new Date().getTime()
  const dateDifference = attendanceOpeningDate.getTime() - now

  if (Math.abs(dateDifference) > THREE_DAYS_MS) {
    const formatter = new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "long",
      weekday: "long",
    })

    // "mandag 12. april"
    const value = formatter.format(attendanceOpeningDate)

    return { value, isRelative: false }
  }

  const days = Math.floor(Math.abs(dateDifference) / ONE_DAY_MS)
  const hours = Math.floor((Math.abs(dateDifference) % ONE_DAY_MS) / ONE_HOUR_MS)
  const minutes = Math.floor((Math.abs(dateDifference) % ONE_HOUR_MS) / ONE_MINUTE_MS)
  const seconds = Math.floor((Math.abs(dateDifference) % ONE_MINUTE_MS) / ONE_SECOND_MS)

  let value = "nå"

  if (days > 0) {
    value = `${days} dag${days === 1 ? "" : "er"}`
  } else if (hours > 0) {
    value = `${hours} time${hours === 1 ? "" : "r"}`
  } else if (minutes > 0) {
    value = `${minutes} minutt${minutes === 1 ? "" : "er"}`
  } else if (seconds > 0) {
    value = `${seconds} sekund${seconds === 1 ? "" : "er"}`
  }

  return { value, isRelative: true }
}

const getStatusDate = (date: Date, status: StatusState): string => {
  const { value, isRelative } = dateToString(date)

  switch (status) {
    case "NOT_OPENED":
      return isRelative ? `Åpner om <strong>${value}</strong>` : `Åpner <strong>${value}</strong>`
    case "OPEN":
      return isRelative ? `Stenger om <strong>${value}</strong>` : `Stenger <strong>${value}</strong>`
    case "CLOSED":
      return isRelative ? `Stengte for <strong>${value}</strong> siden` : `Stengte <strong>${value}</strong>`
    default:
      return "ukjent"
  }
}
