"use client"

import { useTRPC } from "@/utils/trpc/client"
import {
  type Attendance,
  type AttendancePool,
  type AttendanceSelectionResponse,
  type Attendee,
  type Punishment,
  type User,
  canUserAttendPool,
  getActiveMembership,
} from "@dotkomonline/types"
import { Icon, Text, Title, cn } from "@dotkomonline/ui"
import { useQueries, useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"
import { getAttendanceStatus } from "../attendanceStatus"
import { useDeregisterMutation, useRegisterMutation, useSetSelectionsOptionsMutation } from "./../mutations"
import { AttendanceDateInfo } from "./AttendanceDateInfo"
import { MainPoolCard } from "./MainPoolCard"
import { NonAttendablePoolsBox } from "./NonAttendablePoolsBox"
import { PunishmentBox } from "./PunishmentBox"
import { RegistrationButton } from "./RegistrationButton"
import { SelectionsForm } from "./SelectionsForm"
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
  initialPunishment: Punishment | null
  user?: User
}

export const AttendanceCard = ({
  user,
  initialAttendance,
  initialAttendees,
  initialPunishment,
}: AttendanceCardProps) => {
  const trpc = useTRPC()

  const [{ data: attendance, isLoading: attendanceLoading }, { data: punishment, isLoading: punishmentLoading }] =
    useQueries({
      queries: [
        trpc.attendance.getAttendance.queryOptions(
          {
            id: initialAttendance.id,
          },
          { initialData: initialAttendance, enabled: user !== undefined }
        ),
        trpc.personalMark.getExpiryDateForUser.queryOptions({ userId: user?.id ?? "" }, {
          initialData: initialPunishment,
          enabled: user !== undefined,
        }),
      ],
    })

  const { data: attendees, isLoading: attendeesLoading } = useQuery(
    trpc.attendance.getAttendees.queryOptions(
      {
        attendanceId: attendance?.id,
      },
      { initialData: initialAttendees, enabled: user !== undefined }
    )
  )

  const attendee = user && attendees?.find((attendee) => attendee.userId === user.id)

  const registerMutation = useRegisterMutation()
  const deregisterMutation = useDeregisterMutation()
  const selectionsMutation = useSetSelectionsOptionsMutation()

  const handleSelectionChange = (selections: AttendanceSelectionResponse[]) => {
    if (!attendee) {
      return
    }

    selectionsMutation.mutate({
      attendeeId: attendee.id,
      options: selections,
    })
  }

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

  const isLoading =
    attendanceLoading ||
    attendeesLoading ||
    punishmentLoading ||
    deregisterMutation.isPending ||
    registerMutation.isPending

  const isLoggedIn = Boolean(user)
  const isAttending = Boolean(attendee)
  const hasMembership = user !== undefined && getActiveMembership(user) !== null
  const hasPunishment = punishment && (punishment.delay > 0 || punishment.suspended)

  const queuePosition = getQueuePosition(attendee, attendees, attendablePool)
  const isAttendingAndReserved = Boolean(attendee) && queuePosition === null

  return (
    <section className="flex flex-col gap-4 min-h-[6rem] rounded-lg sm:border sm:border-gray-200 sm:dark:border-stone-900 sm:dark:bg-stone-900 sm:p-4 sm:rounded-xl">
      <Title element="h2" size="lg">
        Påmelding
      </Title>

      <AttendanceDateInfo attendance={attendance} />

      {punishment && hasPunishment && !isAttending && <PunishmentBox punishment={punishment} />}

      <MainPoolCard
        pool={attendablePool}
        attendee={attendee}
        queuePosition={queuePosition}
        isLoggedIn={isLoggedIn}
        hasMembership={hasMembership}
        punishment={punishment}
      />

      {isAttendingAndReserved && attendance.selections.length > 0 && attendee && (
        <div className="flex flex-col gap-2">
          <Title element="p" size="sm" className="text-base">
            Valg
          </Title>

          <SelectionsForm
            selections={attendance.selections}
            attendeeSelections={attendee.selections}
            onSubmit={handleSelectionChange}
            disabled={attendanceStatus === "Closed"}
          />
        </div>
      )}

      {nonAttendablePools.length > 0 && (
        <NonAttendablePoolsBox pools={nonAttendablePools} hasAttendablePool={Boolean(attendablePool)} />
      )}

      {attendee && isAttendingAndReserved ? (
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <ViewAttendeesButton
            attendeeListOpen={attendeeListOpen}
            setAttendeeListOpen={setAttendeeListOpen}
            attendees={attendees}
            isLoggedIn={isLoggedIn}
            userId={user.id}
          />
          <TicketButton attendeeId={attendee.id} />
        </div>
      ) : (
        <ViewAttendeesButton
          attendeeListOpen={attendeeListOpen}
          setAttendeeListOpen={setAttendeeListOpen}
          attendees={attendees}
          isLoggedIn={isLoggedIn}
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
        punishment={punishment}
      />

      <div className="hidden sm:block">
        <div className="flex flex-row gap-4 text-gray-800 hover:text-black dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
          <div className="flex flex-row gap-1 items-center cursor-pointer">
            <Icon icon="tabler:book-2" className="text-lg" />
            <Text className="text-sm">Arrangementregler</Text>
          </div>

          <Link href="/profil" className="flex flex-row gap-1 items-center">
            <Icon icon="tabler:edit" className="text-lg" />
            <Text className="text-sm">Oppdater matallergier</Text>
          </Link>
        </div>
      </div>
    </section>
  )
}

export const AttendanceCardSkeleton = () => {
  const skeletonText = (min: number, max: number, height?: string) => (
    <div
      className={cn("h-4 bg-gray-300 dark:bg-stone-700 rounded-full animate-pulse", height)}
      style={{ width: `${Math.random() * (max - min) + min}%` }}
    />
  )

  const dateInfo = () => (
    <div className="flex flex-col gap-1 w-[25%]">
      {skeletonText(80, 100, "h-5")}
      {skeletonText(80, 100)}
    </div>
  )

  const title = skeletonText(40, 60, "h-8")
  const card = <div className="min-h-[12rem] rounded-lg bg-gray-300 dark:bg-stone-700 animate-pulse" />
  const button = <div className="min-h-[4rem] rounded-lg bg-gray-300 dark:bg-stone-700 animate-pulse" />

  return (
    <section className="flex flex-col gap-4 min-h-[6rem] rounded-lg sm:border sm:border-gray-200 sm:dark:border-stone-900 sm:dark:bg-stone-900 sm:p-4 sm:rounded-xl">
      {title}

      <div className="flex flex-row gap-2 items-center">
        {dateInfo()}
        <span className="grow h-0.5 rounded-full bg-gray-300 dark:bg-stone-700 animate-pulse invisible sm:visible" />
        {dateInfo()}
        <span className="grow h-0.5 rounded-full bg-gray-300 dark:bg-stone-700 animate-pulse invisible sm:visible" />
        {dateInfo()}
      </div>

      {card}

      {button}

      {button}
    </section>
  )
}
