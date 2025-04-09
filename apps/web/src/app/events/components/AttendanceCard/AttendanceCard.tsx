"use client"

import { useTRPC } from "@/utils/trpc/client"
import { type Attendance, type AttendancePool, type Attendee, type User, canUserAttendPool } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { getAttendanceStatus } from "../attendanceStatus"
import { AttendanceBoxPool } from "./AttendanceBoxPool"
import { AttendanceBoxPoolSmall } from "./AttendanceBoxPoolSmall"
import AttendanceDateInfo from "./AttendanceDateInfo"
import { RegistrationButton } from "./RegistrationButton"
import ViewAttendeesDialogButton from "./ViewAttendeesButton"
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

  function poolSortKey(pool: AttendancePool) {
    if (attendee && pool.id === attendee.attendanceId) {
      return 1
    }

    if (user && canUserAttendPool(pool, user)) {
      return 0
    }

    return -1
  }

  const pools = attendance.pools.sort((a, b) => poolSortKey(b) - poolSortKey(a))
  const attendablePool = user && pools.find((pool) => canUserAttendPool(pool, user))

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const attendanceStatus = getAttendanceStatus(attendance)

  const registerForAttendance = async () =>
    attendablePool &&
    attendee &&
    registerMutation.mutate({ attendanceId: attendance.id, attendancePoolId: attendablePool.id })

  const deregisterForAttendance = () =>
    attendablePool && attendee && deregisterMutation.mutate({ attendanceId: attendance.id })

  const isLoading = attendanceLoading || attendeeLoading || deregisterMutation.isPending || registerMutation.isPending

  const smallPools = attendance.pools.filter((pool) => pool.id !== attendablePool?.id)

  return (
    <section className="flex flex-col bg-slate-2 rounded-xl min-h-[6rem] mb-8 p-6 gap-4">
      <h2 className="border-none">Påmelding</h2>

      <AttendanceDateInfo attendance={attendance} />

      <AttendanceBoxPool pool={attendablePool} isAttending={Boolean(attendee)} />

      {smallPools.length > 0 && (
        <div className="flex flex-row gap-4">{smallPools.map((pool) => AttendanceBoxPoolSmall({ pool }))}</div>
      )}

      <ViewAttendeesDialogButton attendeeListOpen={attendeeListOpen} setAttendeeListOpen={setAttendeeListOpen} />

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
