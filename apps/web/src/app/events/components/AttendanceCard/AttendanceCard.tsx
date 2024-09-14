"use client"

import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Event, ExtrasChoices } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import type { Session } from "next-auth"
import { type FC, useState } from "react"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import { useRegisterMutation, useSetExtrasChoicesMutation, useUnregisterMutation } from "../mutations"
import ChooseExtrasForm from "./ChooseExtrasDialog"
import { RegistrationButton } from "./RegistrationButton"
import type { WebEventDetail } from "@dotkomonline/types"
import { attendanceRouter } from "@dotkomonline/gateway-trpc/src/modules/event/attendance-router"


interface Props {
  sessionUser?: Session["user"]
  initialEventDetail: WebEventDetail
}

export const AttendanceCard: FC<Props> = ({ sessionUser, initialEventDetail}) => {
  const { data: eventDetail, ...eventDetailQuery } = trpc.event.getWebEventDetailData.useQuery(
    initialEventDetail.event.id, {
        enabled: Boolean(sessionUser),
        initialData: initialEventDetail,
    })

  if (!eventDetail.hasAttendance) return null;

  const { data: attendee } = trpc.event.attendance.getAttendee.useQuery({
    attendanceId: eventDetail.attendance.id,
    userId: sessionUser?.id!
  }, {
    enabled: Boolean(sessionUser),
  })

  const [extraDialogOpen, setExtraDialogOpen] = useState(false)
  const setExtrasChoices = useSetExtrasChoicesMutation()

  const { data: user } = trpc.user.getMe.useQuery()

  const handleGatherExtrasChoices = () => {
    if (eventDetail.attendance.extras !== null) {
      setExtraDialogOpen(true)
    }
  }

  const registerMutation = useRegisterMutation({ onSuccess: handleGatherExtrasChoices })
  const unregisterMutation = useUnregisterMutation()
  const registerLoading = registerMutation.isLoading || unregisterMutation.isLoading || eventDetailQuery.isLoading

  const userIsRegistered = Boolean(attendee)

  const attendablePool = (user && eventDetail.pools.find((pool) => pool.yearCriteria.includes(user?.studyYear))) ?? null

  const registerForAttendance = async () => {
    if (!attendablePool) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser || !user) {
      throw new Error("Tried to register user without session")
    }

    await registerMutation.mutate({
      attendancePoolId: attendablePool?.id,
      userId: user.id,
    })

    await eventDetailQuery.refetch()
  }

  const unregisterForAttendance = async () => {
    if (!attendee) {
      throw new Error("Tried to unregister user that is not registered")
    }

    await unregisterMutation.mutate({
      id: attendee?.id,
    })

    await eventDetailQuery.refetch()
  }

  const viewAttendeesButton = (
    <Button className="w-full rounded-lg uppercase bg-blue-10 h-100" onClick={() => console.log("WIP")}>
      Vis påmeldte
    </Button>
  )

  return (
    <section className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-6 gap-3">
      <h2 className="border-none">Påmelding</h2>
      <AttendanceBoxPool pool={attendablePool} isAttending={userIsRegistered} />

      <div className="flex flex-row gap-3">
        {viewAttendeesButton}
        {
            attendee !== undefined &&
              <RegistrationButton
                attendee={attendee}
                attendance={eventDetail.attendance}
                attendancePool={attendablePool}
                registerForAttendance={registerForAttendance}
                unregisterForAttendance={unregisterForAttendance}
                isLoading={registerLoading}
                />
        }
      </div>
      {
        attendee && eventDetail.attendance.extras !== null &&
          <div className="w-full">
            <ChooseExtrasForm
              extras={eventDetail.attendance.extras}
              onSubmit={(choices: ExtrasChoices) => {
                setExtrasChoices.mutate({
                  id: attendee.id,
                  choices,
                })
                setExtraDialogOpen(false)
              }}
            />
          </div>
      }

      <div className="flex flex-row gap-3">
        <p className="text-xs text-slate-9">Oppdater matallergier</p>
        <p className="text-xs text-slate-9">Arrangementregler</p>
      </div>
    </section>
  )
}
