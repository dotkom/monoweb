import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Attendee, Event } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import clsx from "clsx"
import type { Session } from "next-auth"
import { type FC, useState } from "react"
import { AttendanceGroup } from "../AttendanceGroup"
import { StatusCard } from "../StatusCard"
import { useRegisterMutation, useSetExtrasChoicesMutation, useUnregisterMutation } from "../mutations"
import { ChooseExtrasDialog } from "./ChooseExtrasDialog"

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

interface Props {
  sessionUser?: Session["user"]
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
  attendee: Attendee | null
}

type StatusState = "CLOSED" | "NOT_OPENED" | "OPEN"

export const AttendanceBox: FC<Props> = ({ sessionUser, attendance, pools, event, attendee }) => {
  const attendanceId = event.attendanceId
  const [extraDialogOpen, setExtraDialogOpen] = useState(false)
  const setExtrasChoices = useSetExtrasChoicesMutation()

  const { data: user } = trpc.user.getMe.useQuery()

  if (!attendanceId) {
    throw new Error("AttendanceBox rendered for event without attendance")
  }

  const handleGatherExtrasChoices = () => {
    if (attendance.extras !== null) {
      setExtraDialogOpen(true)
    }
  }

  const registerMutation = useRegisterMutation({ onSuccess: handleGatherExtrasChoices })
  const unregisterMutation = useUnregisterMutation()
  const attendanceStatus = calculateStatus({
    registerStart: attendance.registerStart,
    registerEnd: attendance.registerEnd,
    now: new Date(),
  })
  const userIsRegistered = Boolean(attendee)
  const myGroups = user && pools?.find((a) => a.yearCriteria.includes(user?.studyYear))

  const visiblePools = pools?.filter((pool) => pool.isVisible)

  const registerForAttendance = () => {
    if (!myGroups) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser) {
      throw new Error("Tried to register user without session")
    }

    registerMutation.mutate({
      attendancePoolId: myGroups?.id,
      userId: user?.id,
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

  return (
    <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
      <h2>Påmelding</h2>
      <div>
        {attendance.extras && (
          <ChooseExtrasDialog
            choices={attendee?.extrasChoices ?? null}
            setOpen={setExtraDialogOpen}
            open={extraDialogOpen}
            extras={attendance.extras}
            onSubmit={(values) => {
              if (!attendee) {
                throw new Error("Tried to set extras for a non-registered user")
              }
              setExtrasChoices.mutate({ id: attendee.id, choices: values })
              setExtraDialogOpen(false)
            }}
          />
        )}
      </div>
      <div className="mt-2">
        <StatusCard attendance={attendance} />
      </div>

      {userIsRegistered && attendance.extras && (
        <Button className="mt-2 w-full" onClick={handleGatherExtrasChoices}>
          Endre valg
        </Button>
      )}

      <div>
        {attendanceStatus === "OPEN" &&
          (userIsRegistered ? (
            <Button className="mt-2 w-full text-white" color="red" variant="solid" onClick={unregisterForAttendance}>
              Meld meg av
            </Button>
          ) : (
            <Button className="mt-2 w-full" onClick={registerForAttendance}>
              Meld meg på
            </Button>
          ))}
      </div>

      {visiblePools?.length !== 0 && (
        <div className="mt-4">
          <p>Påmeldingsgrupper</p>
          <div className="flex flex-wrap w-full">
            {visiblePools?.map((group, idx) => (
              <AttendanceGroup
                title={group.title}
                numberOfPeople={group.numAttendees}
                totalSpots={group.capacity}
                key={group.id}
                className={clsx(idx === 0 ? "mr-2" : "", "mt-4 w-32")}
                isAttending={false}
                canAttend={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
