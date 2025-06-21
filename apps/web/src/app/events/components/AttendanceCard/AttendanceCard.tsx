"use client"

import { useTRPC } from "@/utils/trpc/client"
import { type Attendance, type AttendancePool, type Attendee, type User, canUserAttendPool } from "@dotkomonline/types"
import { Icon, Text, Title } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"
import { getAttendanceStatus } from "../attendanceStatus"
import { useDeregisterMutation, useRegisterMutation } from "./../mutations"
import { AttendanceDateInfo } from "./AttendanceDateInfo"
import { MainPoolCard } from "./MainPoolCard"
import { NonAttendablePoolsBox } from "./NonAttendablePoolsBox"
import { RegistrationButton } from "./RegistrationButton"
import { TicketButton } from "./TicketButton"
import { ViewAttendeesButton } from "./ViewAttendeesButton"

const getQueuePosition = (
  attendee: Attendee | undefined,
  attendees: Attendee[] | undefined,
  attendablePool: AttendancePool | undefined
) => {
  if (!attendee || !attendees || !attendablePool) {
    return null
  }

  // This requires attendees are be sorted by reserveTime ascending
  const index = attendees.filter((attendee) => !attendee.reserved).indexOf(attendee)

  if (index === -1) {
    return null
  }

  return index + 1
}

interface AttendanceCardProps {
  initialAttendance: Attendance
  initialAttendees: Attendee[]
  user?: User
}

export const AttendanceCard = ({ user, initialAttendance, initialAttendees }: AttendanceCardProps) => {
  const trpc = useTRPC()
  const { data: attendance, isLoading: attendanceLoading } = useQuery(
    trpc.attendance.getAttendance.queryOptions(
      {
        id: initialAttendance.id,
      },
      { initialData: initialAttendance, enabled: user !== undefined }
    )
  )

  const { data: attendees, isLoading: attendeesLoading } = useQuery(
    trpc.attendance.getAttendees.queryOptions(
      {
        attendanceId: attendance?.id,
      },
      { initialData: initialAttendees, enabled: user !== undefined }
    )
  )

  const attendee = user && attendees?.find((attendee) => attendee.userId === user.id)

  const registerMutation = useRegisterMutation({})
  const deregisterMutation = useDeregisterMutation()

  const attendablePool = attendee
    ? attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
    : user && attendance.pools.find((pool) => canUserAttendPool(pool, user))
  const nonAttendablePools = attendance.pools
    .filter((pool) => pool.id !== attendablePool?.id)
    .sort((a, b) => {
      if (a.mergeDelayHours && b.mergeDelayHours && a.mergeDelayHours !== b.mergeDelayHours) {
        return a.mergeDelayHours - b.mergeDelayHours
      }

      return b.capacity - a.capacity
    })

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const attendanceStatus = getAttendanceStatus(attendance)

  const registerForAttendance = async () =>
    attendablePool && registerMutation.mutate({ attendanceId: attendance.id, attendancePoolId: attendablePool.id })

  const deregisterForAttendance = () =>
    attendablePool && attendee && deregisterMutation.mutate({ attendanceId: attendance.id })

  const isLoading = attendanceLoading || attendeesLoading || deregisterMutation.isPending || registerMutation.isPending
  const isLoggedIn = Boolean(user)
  const hasMembership = Boolean(user?.membership)

  const queuePosition = getQueuePosition(attendee, attendees, attendablePool)
  const isAttendingAndReserved = Boolean(attendee) && queuePosition === null

  return (
    <section className="flex flex-col border border-slate-5 rounded-xl min-h-[6rem] p-4 sm:p-6 gap-4">
      <Title element="h2" className="font-poppins font-semibold text-2xl">
        Påmelding
      </Title>

      <AttendanceDateInfo attendance={attendance} />

      <MainPoolCard
        pool={attendablePool}
        attendee={attendee}
        queuePosition={queuePosition}
        isLoggedIn={isLoggedIn}
        hasMembership={hasMembership}
        attendanceSelections={attendance.selections}
        status={attendanceStatus}
      />

      {nonAttendablePools.length > 0 && (
        <NonAttendablePoolsBox pools={nonAttendablePools} hasAttendablePool={Boolean(attendablePool)} />
      )}

      {attendee && user ? (
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <ViewAttendeesButton
            attendeeListOpen={attendeeListOpen}
            setAttendeeListOpen={setAttendeeListOpen}
            attendees={attendees}
            userId={user.id}
          />
          {isAttendingAndReserved && <TicketButton attendeeId={attendee.id} />}
        </div>
      ) : (
        <ViewAttendeesButton
          attendeeListOpen={attendeeListOpen}
          setAttendeeListOpen={setAttendeeListOpen}
          attendees={attendees}
          userId={user?.id}
        />
      )}

      <RegistrationButton
        attendee={attendee}
        attendance={attendance}
        pool={attendablePool}
        registerForAttendance={registerForAttendance}
        unregisterForAttendance={deregisterForAttendance}
        isLoading={isLoading}
        isLoggedIn={isLoggedIn}
        hasMembership={hasMembership}
        status={attendanceStatus}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <Link href="/profile" className="flex flex-row gap-1 items-center sm:text-sm text-slate-12 hover:text-slate-11">
          <Icon className="inline-block align-middle text-lg" icon="tabler:edit" />
          <Text>Oppdater matallergier</Text>
        </Link>
        <Text className="flex flex-row gap-1 items-center sm:text-sm text-slate-12 hover:text-slate-11 cursor-pointer">
          <Icon className="inline-block align-middle text-lg" icon="tabler:book-2" />
          Arrangementregler
        </Text>
      </div>
    </section>
  )
}
