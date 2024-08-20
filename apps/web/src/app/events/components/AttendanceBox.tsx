import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Event } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import type { Session } from "next-auth"
import type { FC, ReactElement } from "react"
import { AttendanceBoxPool } from "./AttendanceBoxPool"
import { useRegisterMutation, useUnregisterMutation } from "./mutations"
import { useGetAttendee } from "./queries"
import { getStructuredDateInfo } from "../utils"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"

interface Props {
  sessionUser?: Session["user"]
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
}

type StatusState = "CLOSED" | "NOT_OPENED" | "OPEN"

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

// Biome ignores do not work in the middle of jsx so this is extracted just to igonre the rule here
// biome-ignore lint/security/noDangerouslySetInnerHtml: We do not pass any user input into this, so it is safe
const span = (text: string) => <span dangerouslySetInnerHTML={{ __html: text }} />

export const AttendanceBox: FC<Props> = ({ sessionUser, attendance, pools, event }) => {
  const attendanceId = event.attendanceId

  const { data: user } = trpc.user.getMe.useQuery()

  if (!attendanceId) {
    throw new Error("AttendanceBox rendered for event without attendance")
  }

  const registerMutation = useRegisterMutation()
  const unregisterMutation = useUnregisterMutation()

  const { data: attendee } = useGetAttendee({ userId: sessionUser?.id, attendanceId })
  const userIsRegistered = Boolean(attendee)

  const attendanceStatus = calculateStatus({
    registerStart: attendance.registerStart,
    registerEnd: attendance.registerEnd,
    now: new Date(),
  })

  const attendablePoolOrNullish = user && pools.find((pool) => pool.yearCriteria.includes(user?.studyYear))
  const canAttend = Boolean(attendablePoolOrNullish) && attendanceStatus === "OPEN"

  const registerForAttendance = () => {
    if (!attendablePoolOrNullish) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser) {
      throw new Error("Tried to register user without session")
    }

    registerMutation.mutate({
      attendancePoolId: attendablePoolOrNullish?.id,
      userId: sessionUser.id,
    })
  }

  const unregisterForAttendance = () => {
    if (!attendee) {
      throw new Error("Tried to unregister user that is not registered")
    }

    return unregisterMutation.mutate({
      id: attendee?.id,
    })
  }

  const structuredDateInfo = getStructuredDateInfo(attendance, new Date())

  let changeRegisteredStateButton: ReactElement<typeof Button>
  let eventAttendanceStatusText: string

  switch (structuredDateInfo.status) {
    case "NOT_OPENED": {
      eventAttendanceStatusText = `Åpner ${formatDate(structuredDateInfo.timeUtilOpen)}`
      break
    }
    case "OPEN": {
      eventAttendanceStatusText = `Stenger ${formatDate(structuredDateInfo.timeUntilClose)}`
      break
    }
    case "CLOSED": {
      eventAttendanceStatusText = `Stengte ${formatDate(structuredDateInfo.timeElapsedSinceClose)}`
      break
    }
    default:
      throw new Error("Unknown status")
  }

  if (userIsRegistered) {
    changeRegisteredStateButton = (
      <Button className="w-full text-white rounded-lg" color="red" variant="solid" onClick={unregisterForAttendance}>
        Meld meg av
      </Button>
    )
  } else {
    changeRegisteredStateButton = (
      <Button
        className={clsx(
          "w-full rounded-lg uppercase flex flex-col gap-3 items-center h-fit p-2",
          canAttend ? "bg-green-10" : "bg-slate-10"
        )}
        onClick={registerForAttendance}
        disabled={!canAttend}
      >
        <span className="block">Meld meg på</span>
        <span className="block text-sm">{eventAttendanceStatusText}</span>
      </Button>
    )
  }

  const viewAttendeesButton = (
    <Button className="w-full rounded-lg uppercase bg-blue-10 h-100" onClick={() => console.log("WIP")}>
      Se påmeldte
    </Button>
  )

  return (
    <section className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-4 gap-3">
      <h2 className="border-none">Påmelding</h2>
      {<AttendanceBoxPool pool={attendablePoolOrNullish} />}
      <div className="flex flex-row gap-3">
        {viewAttendeesButton}
        {changeRegisteredStateButton}
      </div>
    </section>
  )
}
