import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Event } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import type { Session } from "next-auth"
import type { FC, ReactElement } from "react"
import { AttendanceBoxPool } from "./AttendanceBoxPool"
import { useRegisterMutation, useUnregisterMutation } from "./mutations"
import { useGetAttendee } from "./queries"

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

interface Props {
  sessionUser?: Session["user"]
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
}

type StatusState = "CLOSED" | "NOT_OPENED" | "OPEN"

export const AttendanceBox: FC<Props> = ({ sessionUser, attendance, pools, event }) => {
  const attendanceId = event.attendanceId

  const { data: user } = trpc.user.getMe.useQuery()

  if (!attendanceId) {
    throw new Error("AttendanceBox rendered for event without attendance")
  }

  const registerMutation = useRegisterMutation()
  const unregisterMutation = useUnregisterMutation()
  const { data: attendee } = useGetAttendee({ userId: sessionUser?.id, attendanceId })

  const attendanceStatus = calculateStatus({
    registerStart: attendance.registerStart,
    registerEnd: attendance.registerEnd,
    now: new Date(),
  })
  const userIsRegistered = Boolean(attendee)
  const attendablePool = user && pools.find((a) => a.yearCriteria.includes(user?.studyYear))

  const registerForAttendance = () => {
    if (!attendablePool) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser) {
      throw new Error("Tried to register user without session")
    }

    registerMutation.mutate({
      attendancePoolId: attendablePool?.id,
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

  let changeRegisteredStateButton: ReactElement<typeof Button>

  if (userIsRegistered) {
    changeRegisteredStateButton = (
      <Button className="w-full text-white rounded-xl" color="red" variant="solid" onClick={unregisterForAttendance}>
        Meld meg av
      </Button>
    )
  } else {
    changeRegisteredStateButton = (
      <Button className="w-full rounded-xl" onClick={registerForAttendance}>
        Meld meg på
      </Button>
    )
  }

  const viewAttendeesButton = (
    <Button className="w-full rounded-xl" onClick={() => console.log("WIP")}>
      Se påmeldte
    </Button>
  )

  return (
    <div className="flex flex-col bg-slate-2 rounded-3xl min-h-64 mb-8 px-4 py-4 gap-3">
      <h2>Påmelding</h2>
      {attendablePool && <AttendanceBoxPool pool={attendablePool} />}
      <div className="flex flex-row gap-6">
        {viewAttendeesButton}
        {attendanceStatus === "OPEN" && changeRegisteredStateButton}
      </div>
    </div>
  )
}
