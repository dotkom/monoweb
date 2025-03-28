"use client"

import { useTRPC } from "@/utils/trpc/client"
import { Icon } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import type { Session } from "next-auth"
import { type FC, useState } from "react"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import { useRegisterMutation, useSetSelectionsOptionsMutation, useUnregisterMutation } from "../mutations"
import ChooseSelectionsForm from "./AttendanceSelectionsDialog"
import { RegistrationButton } from "./RegistrationButton"
import ViewAttendeesDialogButton from "./ViewAttendeesButton"
import {Attendance, AttendanceEventDetail} from "@dotkomonline/types";

interface AttendanceCardProps {
  sessionUser?: Session["user"]
  initialEventDetail: AttendanceEventDetail
}

export const AttendanceCard: FC<AttendanceCardProps> = ({ sessionUser, initialEventDetail }) => {
  const trpc = useTRPC()
  const { data: eventDetail, ...eventDetailQuery } = useQuery({
    ...trpc.event.getAttendanceEventDetail.queryOptions(initialEventDetail.event.id),
    enabled: sessionUser !== undefined,
    initialData: initialEventDetail,
  })

  if (!eventDetail || eventDetail.attendance === null) {
    return null
  }

  return (
    <AttendanceCardInner
      eventDetail={eventDetail}
      sessionUser={sessionUser}
      attendance={eventDetail.attendance}
      refetchEventDetail={eventDetailQuery.refetch}
    />
  )
}

interface InnerAttendanceCardProps {
  sessionUser?: Session["user"]
  attendance: Attendance
  // TODO: Directly use query instead here
  refetchEventDetail: () => void
  eventDetail: AttendanceEventDetail
}

export const AttendanceCardInner: FC<InnerAttendanceCardProps> = ({ sessionUser, eventDetail, attendance, refetchEventDetail }) => {
  const trpc = useTRPC()
  const { data: attendee } = useQuery(
    trpc.event.attendance.getAttendee.queryOptions(
      {
        attendanceId: eventDetail.attendance?.id ?? "",
        userId: sessionUser?.id ?? "",
      },
      {
        enabled: Boolean(sessionUser) && eventDetail.attendance !== null,
      }
    )
  )

  const [, setSelectionsDialogOpen] = useState(false)
  const setSelectionsOptions = useSetSelectionsOptionsMutation()

  const { data: user } = useQuery(trpc.user.getMe.queryOptions())

  const handleGatherSelectionResponses = () => {
    if (attendance.selections.length > 0) {
      setSelectionsDialogOpen(true)
    }
  }

  const attendedPool = attendee?.attendancePoolId
    ? attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
    : null

  const registerMutation = useRegisterMutation({ onSuccess: handleGatherSelectionResponses })
  const unregisterMutation = useUnregisterMutation()
  const registerLoading = registerMutation.isPending || unregisterMutation.isPending

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

      {attendee && attendance.selections.length > 0 && (
        <div className="w-full">
          <ChooseSelectionsForm
            selections={attendance.selections}
            onSubmit={(options) => {
              setSelectionsOptions.mutate({
                id: attendee.id,
                options,
              })
              setSelectionsDialogOpen(false)
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
