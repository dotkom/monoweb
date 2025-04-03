"use client"

import { useTRPC } from "@/utils/trpc/client"
import type { Attendance, AttendanceEventDetail, AttendanceStatus } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import type { Session } from "next-auth"
import { type FC, useEffect, useState } from "react"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import { useRegisterMutation, useSetSelectionsOptionsMutation, useUnregisterMutation } from "../mutations"
import { getAttendanceStatus } from "../utils"
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

  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("NotOpened")
  const [isAttendanceStartInPast, setIsAttendanceStartInPast] = useState(false)
  const [isAttendanceStartInSameYear, setIsAttendanceStartInSameYear] = useState(false)
  const [isAttendanceClosedInPast, setIsAttendanceClosedInPast] = useState(false)
  const [isAttendanceClosedInSameYear, setIsAttendanceClosedInSameYear] = useState(false)
  const [isDeregisterDeadlineInSameYear, setIsDeregisterDeadlineInSameYear] = useState(false)

  useEffect(() => {
    setAttendanceStatus(getAttendanceStatus(attendance))
    setIsAttendanceStartInPast(attendance.registerStart < new Date())
    setIsAttendanceStartInSameYear(new Date(attendance.registerStart).getFullYear() === new Date().getFullYear())
    setIsAttendanceClosedInPast(attendance.registerEnd < new Date())
    setIsAttendanceClosedInSameYear(new Date(attendance.registerEnd).getFullYear() === new Date().getFullYear())
    setIsDeregisterDeadlineInSameYear(
      new Date(attendance.deregisterDeadline).getFullYear() === new Date().getFullYear()
    )
  }, [attendance])

  const getFormatString = (isInSameYear: boolean) => (isInSameYear ? "dd. MMMM" : "dd.MM.yyyy")
  const registerStartDate = formatDate(attendance.registerStart, getFormatString(isAttendanceStartInSameYear), {
    locale: nb,
  })
  const registerEndDate = formatDate(attendance.registerEnd, getFormatString(isAttendanceClosedInSameYear), {
    locale: nb,
  })
  const deregisterDeadlineDate = formatDate(
    attendance.deregisterDeadline,
    getFormatString(isDeregisterDeadlineInSameYear),
    { locale: nb }
  )

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

      <div className="flex flex-row justify-between space-x-8">
        <div>
          <p className="text-slate-9 text-lg">{isAttendanceStartInPast ? "Åpnet" : "Åpner"}</p>
          <p className="text-slate-9 text-sm">{registerStartDate}</p>
          <p className="text-slate-9 text-sm">kl. {formatDate(attendance.registerStart, "HH:mm", { locale: nb })}</p>
        </div>
        <div>
          <p className="text-slate-9 text-lg">{isAttendanceClosedInPast ? "Lukket" : "Lukker"}</p>
          <p className="text-slate-9 text-sm">{registerEndDate}</p>
          <p className="text-slate-9 text-sm">kl. {formatDate(attendance.registerEnd, "HH:mm", { locale: nb })}</p>
        </div>
        <div>
          <p className="text-slate-9 text-lg">Avmeldingsfrist</p>
          <p className="text-slate-9 text-sm">{deregisterDeadlineDate}</p>
          <p className="text-slate-9 text-sm">
            kl. {formatDate(attendance.deregisterDeadline, "HH:mm", { locale: nb })}
          </p>
        </div>
      </div>

      <AttendanceBoxPool pool={attendedPool} isAttending={userIsRegistered} />

      <div className="flex flex-col gap-3">
        <ViewAttendeesDialogButton attendeeListOpen={attendeeListOpen} setAttendeeListOpen={setAttendeeListOpen} />
        <RegistrationButton
          attendee={attendee}
          attendance={attendance}
          registerForAttendance={registerForAttendance}
          unregisterForAttendance={unregisterForAttendance}
          isLoading={registerLoading}
          status={attendanceStatus}
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
