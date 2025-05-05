"use client"

import { useTRPC } from "@/utils/trpc/client"
import { type Attendance, type AttendancePool, type Attendee, type User, canUserAttendPool } from "@dotkomonline/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Collapsible, CollapsibleContent, CollapsibleTrigger, Icon, Text, Title, cn } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"
import { getAttendanceStatus } from "../attendanceStatus"
import { AttendanceBoxPool } from "./AttendanceBoxPool"
import { AttendanceBoxPoolSmall } from "./AttendanceBoxPoolSmall"
import { AttendanceDateInfo } from "./AttendanceDateInfo"
import { RegistrationButton } from "./RegistrationButton"
import { ViewAttendeesDialogButton } from "./ViewAttendeesButton"
import { useDeregisterMutation, useRegisterMutation } from "./mutations"

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

interface Props {
  initialAttendance: Attendance
  initialAttendees: Attendee[]
  user?: User
}

export const AttendanceCard = ({ user, initialAttendance, initialAttendees }: Props) => {
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

  const isLoading = attendanceLoading || attendeesLoading || deregisterMutation.isPending || registerMutation.isPending
  const isLoggedIn = Boolean(user)
  const hasMembership = Boolean(user?.membership)

  const queuePosition = getQueuePosition(attendee, attendees, attendablePool)

  return (
    <section className="flex flex-col border border-slate-5 rounded-xl min-h-[6rem] p-4 sm:p-6 gap-4">
      <Title element="h2" className="font-poppins font-semibold text-2xl">
        Påmelding
      </Title>

      <AttendanceDateInfo attendance={attendance} />

      <div className="flex flex-col gap-2">
        <AttendanceBoxPool
          pool={attendablePool}
          isAttending={Boolean(attendee)}
          queuePosition={queuePosition}
          userId={user?.id}
          isLoggedIn={isLoggedIn}
          hasMembership={hasMembership}
        />

        <RegistrationButton
          attendee={attendee}
          attendance={attendance}
          pool={attendablePool}
          registerForAttendance={registerForAttendance}
          unregisterForAttendance={deregisterForAttendance}
          isLoading={isLoading}
          status={attendanceStatus}
          isLoggedIn={isLoggedIn}
          hasMembership={hasMembership}
        />
      </div>

      <ViewAttendeesDialogButton
        attendeeListOpen={attendeeListOpen}
        setAttendeeListOpen={setAttendeeListOpen}
        attendees={attendees}
        userId={user?.id}
      />

      {nonAttendablePools.length > 0 && (
        <Collapsible className="w-full flex flex-col gap-2 p-3 border border-slate-5 rounded-lg">
          <CollapsibleTrigger className="flex flex-row gap-1 w-[calc(100% + 1.5rem)] rounded-lg m-[-0.75rem] p-4 hover:bg-slate-2 justify-center items-center">
            <Icon icon="tabler:users-group" className="text-lg" />
            <Text className="font-medium">Vis grupper</Text>
          </CollapsibleTrigger>
          <CollapsibleContent className="w-full mt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {nonAttendablePools.map((pool) => AttendanceBoxPoolSmall({ pool }))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

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
