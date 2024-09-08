"use client"

import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Event } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import type { Session } from "next-auth"
import { type FC, useState } from "react"
import { getStructuredDateInfo } from "../../utils"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import { useRegisterMutation, useSetExtrasChoicesMutation, useUnregisterMutation } from "../mutations"
import ChooseExtrasDialog from "./ChooseExtrasDialog"
import { RegisterMeButton } from "./RegisterMeButton"

interface Props {
  sessionUser?: Session["user"]
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
}

// Biome ignores do not work in the middle of jsx so this is extracted just to igonre the rule here
// biome-ignore lint/security/noDangerouslySetInnerHtml: We do not pass any user input into this, so it is safe
const span = (text: string) => <span dangerouslySetInnerHTML={{ __html: text }} />

export const AttendanceBox: FC<Props> = ({ sessionUser, attendance, pools, event }) => {
  const { data: attendee } = trpc.event.attendance.getAttendee.useQuery({
    attendanceId: attendance.id,
    userId: sessionUser?.id ?? "",
  })
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

  const userIsRegistered = Boolean(attendee)

  const attendablePool = user && pools.find((pool) => pool.yearCriteria.includes(user?.studyYear))
  const { status: attendanceStatus } = getStructuredDateInfo(attendance, new Date())
  const canAttend = Boolean(attendablePool) && attendanceStatus === "OPEN"

  const registerForAttendance = () => {
    if (!attendablePool) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser) {
      throw new Error("Tried to register user without session")
    }

    registerMutation.mutate({
      attendancePoolId: attendablePool?.id,
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

  const viewAttendeesButton = (
    <Button className="w-full rounded-lg uppercase bg-blue-10 h-100" onClick={() => console.log("WIP")}>
      Vis påmeldte
    </Button>
  )

  if (attendee === undefined) {
    return <div>Loading</div>
  }

  return (
    <section className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-4 gap-3">
      <h2 className="border-none">Påmelding</h2>
      {<AttendanceBoxPool pool={attendablePool} />}

      {userIsRegistered && attendance.extras && (
        <section>
          <ChooseExtrasDialog
            defaultValues={attendee?.extrasChoices && { choices: attendee?.extrasChoices }}
            /*setOpen={setExtraDialogOpen}*/
            /*open={extraDialogOpen}*/
            extras={attendance.extras ?? []}
            onSubmit={(values) => {
              if (!attendee) {
                throw new Error("Tried to set extras for a non-registered user")
              }
              setExtrasChoices.mutate({ id: attendee.id, choices: values })
              setExtraDialogOpen(false)
            }}
          />
        </section>
      )}

      <div className="flex flex-row gap-3">
        {viewAttendeesButton}
        <RegisterMeButton
          attendee={attendee}
          attendance={attendance}
          hasAttendancePool={canAttend}
          registerForAttendance={registerForAttendance}
          unregisterForAttendance={unregisterForAttendance}
        />
      </div>
    </section>
  )
}
