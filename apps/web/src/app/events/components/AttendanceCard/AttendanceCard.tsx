"use client"

import { useTRPC } from "@/utils/trpc/client"
import type { Session } from "@dotkomonline/oauth2/session"
import type { Attendance, AttendanceEventDetail } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import { type FC, useState } from "react"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import { useRegisterMutation, useSetSelectionsOptionsMutation, useUnregisterMutation } from "../mutations"
import ChooseSelectionsForm from "./AttendanceSelectionsDialog"
import { RegistrationButton } from "./RegistrationButton"
import ViewAttendeesDialogButton from "./ViewAttendeesButton"

interface AttendanceCardProps {
  session: Session | null
  initialEventDetail: AttendanceEventDetail
}

export const AttendanceCard: FC<AttendanceCardProps> = ({ session, initialEventDetail }) => {
  const trpc = useTRPC()
  const { data: eventDetail, ...eventDetailQuery } = useQuery({
    ...trpc.event.getAttendanceEventDetail.queryOptions(initialEventDetail.event.id),
    enabled: session !== undefined,
    initialData: initialEventDetail,
  })

  if (!eventDetail || eventDetail.attendance === null) {
    return null
  }

  return (
    <AttendanceCardInner
      eventDetail={eventDetail}
      session={session}
      attendance={eventDetail.attendance}
      refetchEventDetail={eventDetailQuery.refetch}
    />
  )
}

interface InnerAttendanceCardProps {
  session: Session | null
  attendance: Attendance
  // TODO: Directly use query instead here
  refetchEventDetail: () => void
  eventDetail: AttendanceEventDetail
}

export const AttendanceCardInner: FC<InnerAttendanceCardProps> = ({
  session,
  eventDetail,
  attendance,
  refetchEventDetail,
}) => {
  const trpc = useTRPC()
  const { data: attendee } = useQuery(
    trpc.event.attendance.getAttendee.queryOptions(
      {
        attendanceId: eventDetail.attendance?.id ?? "",
        userId: session?.sub ?? "",
      },
      {
        enabled: Boolean(session) && eventDetail.attendance !== null,
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

    if (!session || !user) {
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

      <div className="flex flex-col gap-3">
        <ViewAttendeesDialogButton attendeeListOpen={attendeeListOpen} setAttendeeListOpen={setAttendeeListOpen} />
        <RegistrationButton
          attendee={attendee}
          attendance={attendance}
          registerForAttendance={registerForAttendance}
          unregisterForAttendance={unregisterForAttendance}
          isLoading={registerLoading}
          enabled={false}
        />
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
        <a href="/profile" className="flex flex-row gap-1 items-center text-sm text-slate-9">
          <Icon className="inline-block align-middle text-lg" icon="tabler:edit" />
          Oppdater matallergier
        </a>
        <p className="flex flex-row gap-1 items-center text-sm text-slate-9">
          <Icon className="inline-block align-middle text-lg" icon="tabler:book-2" />
          Arrangementregler
        </p>
      </div>
    </section>
  )
}
