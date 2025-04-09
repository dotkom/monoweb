"use client"

import { useTRPC } from "@/utils/trpc/client"
import type { Attendance, AttendanceEventDetail } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import type { Session } from "next-auth"
import { type FC, useState } from "react"
import { getAttendanceStatus } from "../attendanceStatus"
import { useRegisterMutation, useSetSelectionsOptionsMutation, useUnregisterMutation } from "../mutations"
import { AttendanceBoxPool } from "./AttendanceBoxPool"
import { AttendanceBoxPoolSmall } from "./AttendanceBoxPoolSmall"
import AttendanceDateInfo from "./AttendanceDateInfo"
import ChooseSelectionsForm from "./AttendanceSelectionsDialog"
import { RegistrationButton } from "./RegistrationButton"
import ViewAttendeesDialogButton from "./ViewAttendeesButton"

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

export const AttendanceCardInner: FC<InnerAttendanceCardProps> = ({
  sessionUser,
  eventDetail,
  attendance,
  refetchEventDetail,
}) => {
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

  const attendanceStatus = getAttendanceStatus(attendance)

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
    <section className="flex flex-col bg-slate-2 rounded-xl min-h-[6rem] mb-8 p-6 gap-4">
      <h2 className="border-none">Påmelding</h2>

      <AttendanceDateInfo attendance={attendance} />

      <AttendanceBoxPool pool={attendedPool} isAttending={userIsRegistered} />

      {attendance.pools.length > 1 && (
        <div className="flex flex-row gap-4">
          {attendance.pools
            .filter((pool) => pool.id !== attendedPool?.id && pool.isVisible)
            .map((pool) => AttendanceBoxPoolSmall({ pool }))}
        </div>
      )}

      <ViewAttendeesDialogButton attendeeListOpen={attendeeListOpen} setAttendeeListOpen={setAttendeeListOpen} />

      <RegistrationButton
        attendee={attendee}
        attendance={attendance}
        pool={attendedPool}
        registerForAttendance={registerForAttendance}
        unregisterForAttendance={unregisterForAttendance}
        isLoading={registerLoading}
        status={attendanceStatus}
      />

      {attendee && attendance.selections.length > 0 && (
        <div className="w-full mt-4 mb-2">
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

      <div className="flex flex-row gap-4">
        <a href="/profile" className="flex flex-row gap-1 items-center text-sm text-slate-12 hover:text-slate-11">
          <Icon className="inline-block align-middle text-lg" icon="tabler:edit" />
          Oppdater matallergier
        </a>
        <p className="flex flex-row gap-1 items-center text-sm text-slate-12 hover:text-slate-11 cursor-pointer">
          <Icon className="inline-block align-middle text-lg" icon="tabler:book-2" />
          Arrangementregler
        </p>
      </div>
    </section>
  )
}
