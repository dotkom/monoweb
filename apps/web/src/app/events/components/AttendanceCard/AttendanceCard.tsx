"use client"

import { useTRPC } from "@/utils/trpc/client"
import { type Attendance, type Attendee, type User, canUserAttendPool } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { getAttendanceStatus } from "../attendanceStatus"
import { AttendanceBoxPool } from "./AttendanceBoxPool"
import { AttendanceBoxPoolSmall } from "./AttendanceBoxPoolSmall"
import { AttendanceDateInfo } from "./AttendanceDateInfo"
import { RegistrationButton } from "./RegistrationButton"
import { TicketButton } from "./TicketButton"
import { ViewAttendeesDialogButton } from "./ViewAttendeesButton"
import { useDeregisterMutation, useRegisterMutation } from "./mutations"

interface Props {
  initialAttendance: Attendance
  user?: User
  initialAttendee: Attendee | null
}

export const AttendanceCard = ({ user, initialAttendance, initialAttendee }: Props) => {
  const trpc = useTRPC()
  const { data: attendance, isLoading: attendanceLoading } = useQuery(
    trpc.attendance.getAttendance.queryOptions(
      {
        id: initialAttendance.id,
      },
      { initialData: initialAttendance, enabled: user !== undefined }
    )
  )

  const { data: attendee, isLoading: attendeeLoading } = useQuery(
    trpc.attendance.getAttendee.queryOptions(
      {
        // biome-ignore lint/style/noNonNullAssertion: Disabled when user is undefined
        userId: user?.id!,
        attendanceId: attendance?.id,
      },
      { initialData: initialAttendee, enabled: user !== undefined }
    )
  )

  const registerMutation = useRegisterMutation({})
  const deregisterMutation = useDeregisterMutation()

  const attendablePool = user && attendance.pools.find((pool) => canUserAttendPool(pool, user))
  const nonAttendablePools = attendance.pools
    .filter((pool) => pool.id !== attendablePool?.id)
    .sort((a, b) => b.capacity - a.capacity)

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const attendanceStatus = getAttendanceStatus(attendance)

  const registerForAttendance = async () =>
    attendablePool && registerMutation.mutate({ attendanceId: attendance.id, attendancePoolId: attendablePool.id })

  const deregisterForAttendance = () =>
    attendablePool && attendee && deregisterMutation.mutate({ attendanceId: attendance.id })

  const isLoading = attendanceLoading || attendeeLoading || deregisterMutation.isPending || registerMutation.isPending

  return (
    <section className="flex flex-col bg-slate-2 rounded-xl min-h-[6rem] mb-8 p-6 gap-4">
      <h2 className="border-none">Påmelding</h2>

      <AttendanceDateInfo attendance={attendance} />

      <AttendanceBoxPool pool={attendablePool} isAttending={Boolean(attendee)} />

      {nonAttendablePools.length > 0 && (
        <div className="grid grid-cols-3 gap-4">{nonAttendablePools.map((pool) => AttendanceBoxPoolSmall({ pool, attendanceStart: attendance.registerStart }))}</div>
      )}

      {attendee && user ? (
        <div className="flex flex-row gap-4">
          <ViewAttendeesDialogButton attendeeListOpen={attendeeListOpen} setAttendeeListOpen={setAttendeeListOpen} />
          <TicketButton userId={user.id} />
        </div>
      ) : (
        <ViewAttendeesDialogButton attendeeListOpen={attendeeListOpen} setAttendeeListOpen={setAttendeeListOpen} />
      )}

      <RegistrationButton
        attendee={attendee}
        attendance={attendance}
        pool={attendablePool}
        registerForAttendance={registerForAttendance}
        unregisterForAttendance={deregisterForAttendance}
        isLoading={isLoading}
        status={attendanceStatus}
      />

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
