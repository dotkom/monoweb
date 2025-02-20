"use client"

import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendanceEventDetail } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import type { Session } from "next-auth"
import { type FC, useState } from "react"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import { useRegisterMutation, useSetQuestionsChoicesMutation, useUnregisterMutation } from "../mutations"
import ChooseQuestionsForm from "./AttendanceQuestionsDialog"
import { RegistrationButton } from "./RegistrationButton"
import ViewAttendeesDialogButton from "./ViewAttendeesButton"

interface AttendanceCardProps {
  sessionUser?: Session["user"]
  initialEventDetail: AttendanceEventDetail
}

export const AttendanceCard: FC<AttendanceCardProps> = ({ sessionUser, initialEventDetail }) => {
  const { data: eventDetail, ...eventDetailQuery } = trpc.event.getAttendanceEventDetail.useQuery(
    initialEventDetail.event.id,
    {
      enabled: Boolean(sessionUser),
      initialData: initialEventDetail,
    }
  )

  if (!eventDetail || eventDetail.attendance === null) {
    return null
  }

  return (
    <AttendanceCardInner
      sessionUser={sessionUser}
      attendance={eventDetail.attendance}
      refetchEventDetail={eventDetailQuery.refetch}
    />
  )
}

interface InnerAttendanceCardProps {
  sessionUser?: Session["user"]
  attendance: Attendance,
  refetchEventDetail: () => void
}

export const AttendanceCardInner: FC<InnerAttendanceCardProps> = ({ sessionUser, attendance, refetchEventDetail }) => {
  const { data: attendee } = trpc.event.attendance.getAttendee.useQuery(
    {
      attendanceId: attendance.id,
      userId: sessionUser?.id ?? "",
    },
    {
      enabled: Boolean(sessionUser),
    }
  )

  const [, setExtraDialogOpen] = useState(false)
  const setQuestionsChoices = useSetQuestionsChoicesMutation()

  const { data: user } = trpc.user.getMe.useQuery()

  const handleGatherQuestionResponses = () => {
    if (attendance.questions.length > 0) {
      setExtraDialogOpen(true)
    }
  }

  const attendedPool = attendee?.attendancePoolId
    ? attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
    : null

  const registerMutation = useRegisterMutation({ onSuccess: handleGatherQuestionResponses })
  const unregisterMutation = useUnregisterMutation()
  const registerLoading = registerMutation.isLoading || unregisterMutation.isLoading

  const userIsRegistered = Boolean(attendee)

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const registerForAttendance = async () => {
    if (!attendedPool) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser || !user) {
      throw new Error("Tried to register user without session")
    }

    registerMutation.mutate({
      attendancePoolId: attendedPool.id,
      userId: user.id,
    })

    refetchEventDetail()
  }

  const unregisterForAttendance = async () => {
    if (!attendee) {
      throw new Error("Tried to unregister user that is not registered")
    }

    unregisterMutation.mutate({
      id: attendee.id,
    })

    refetchEventDetail()
  }

  return (
    <section className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-6 gap-3">
      <h2 className="border-none">Påmelding</h2>
      <AttendanceBoxPool pool={attendedPool} isAttending={userIsRegistered} />

      <div className="flex flex-row gap-3">
        <ViewAttendeesDialogButton attendeeListOpen={attendeeListOpen} setAttendeeListOpen={setAttendeeListOpen} />
        {attendee !== undefined && (
          <RegistrationButton
            attendee={attendee}
            attendance={attendance}
            registerForAttendance={registerForAttendance}
            unregisterForAttendance={unregisterForAttendance}
            isLoading={registerLoading}
            enabled={false}
          />
        )}
      </div>

      {attendee && attendance.questions.length > 0 && (
        <div className="w-full">
          <ChooseQuestionsForm
            questions={attendance.questions}
            onSubmit={(choices) => {
              setQuestionsChoices.mutate({
                id: attendee.id,
                choices,
              })
              setExtraDialogOpen(false)
            }}
          />
        </div>
      )}

      <div className="flex flex-row gap-3">
        <p className="text-xs text-slate-9">Avmeldingsfrist 12:00 23.09.2024</p>
      </div>
      <div className="flex flex-row gap-3">
        <a href="/profile">
          <p className="text-xs text-slate-9">
            <Icon className="inline-block align-middle text-lg" icon="tabler:edit" />
            Oppdater matallergier
          </p>
        </a>
        <p className="text-xs text-slate-9">
          <Icon className="inline-block align-middle text-lg" icon="tabler:book-2" />
          Arrangementbregler
        </p>
      </div>
    </section>
  )
}
