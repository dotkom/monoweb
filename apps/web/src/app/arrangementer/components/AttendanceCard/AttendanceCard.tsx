"use client"

import { useTRPCSSERegisterChangeConnectionState } from "@/utils/trpc/QueryProvider"
import { useTRPC } from "@/utils/trpc/client"
import {
  type Attendance,
  type AttendanceSelectionResponse,
  type Event,
  type Punishment,
  type User,
  getAttendee,
} from "@dotkomonline/types"
import { Icon, Text, Title, cn } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import { differenceInSeconds, isBefore, secondsToMilliseconds } from "date-fns"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAttendanceStatus } from "../attendanceStatus"
import { useDeregisterMutation, useRegisterMutation, useSetSelectionsOptionsMutation } from "./../mutations"
import { AttendanceDateInfo } from "./AttendanceDateInfo"
import { MainPoolCard } from "./MainPoolCard"
import { NonAttendablePoolsBox } from "./NonAttendablePoolsBox"
import { PaymentCard } from "./PaymentCard"
import { PaymentExplanationDialog } from "./PaymentExplanationDialog"
import { PunishmentBox } from "./PunishmentBox"
import { RegistrationButton } from "./RegistrationButton"
import { SelectionsForm } from "./SelectionsForm"
import { TicketButton } from "./TicketButton"
import { ViewAttendeesButton } from "./ViewAttendeesButton"

interface AttendanceCardProps {
  initialAttendance: Attendance
  initialPunishment: Punishment | null
  user: User | null
  parentEvent: Event | null
  parentAttendance: Attendance | null
}

export const AttendanceCard = ({
  user,
  initialAttendance,
  initialPunishment,
  parentEvent,
  parentAttendance,
}: AttendanceCardProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { setTRPCSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()

  const [closeToEvent, setCloseToEvent] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState(getAttendanceStatus(initialAttendance))

  const [attendanceResponse, punishmentResponse] = useQueries({
    queries: [
      trpc.event.attendance.getAttendance.queryOptions(
        {
          id: initialAttendance.id,
        },
        {
          initialData: initialAttendance,
          enabled: Boolean(user),
          refetchInterval: closeToEvent ? secondsToMilliseconds(1) : secondsToMilliseconds(60),
        }
      ),
      trpc.personalMark.getExpiryDateForUser.queryOptions(
        {
          userId: user?.id ?? "",
        },
        {
          initialData: initialPunishment,
          enabled: Boolean(user),
        }
      ),
    ],
  })

  const { data: attendance, isLoading: attendanceLoading } = attendanceResponse
  const { data: punishment, isLoading: punishmentLoading } = punishmentResponse

  useEffect(() => {
    setAttendanceStatus(getAttendanceStatus(attendance))
  }, [attendance])

  useSubscription(
    trpc.event.attendance.onRegisterChange.subscriptionOptions(
      {
        attendanceId: attendance?.id ?? "",
      },
      {
        onConnectionStateChange: (state) => {
          setTRPCSSERegisterChangeConnectionState(state.state)
        },
        onData: ({ status, attendee }) => {
          // If the attendee is not the current user, we can update the state
          queryClient.setQueryData(
            trpc.event.attendance.getAttendance.queryOptions({ id: attendance?.id }).queryKey,
            (oldData) => {
              if (!oldData) {
                return oldData
              }

              if (status === "deregistered") {
                return {
                  ...oldData,
                  attendees: oldData.attendees.filter((oldAttendee) => oldAttendee.id !== attendee.id),
                }
              }

              if (oldData.attendees.some((oldAttendee) => oldAttendee.id === attendee.id)) {
                console.warn("Attendee already exists in the list, not updating state.")
                return oldData
              }

              return {
                ...oldData,
                attendees: [...oldData.attendees, attendee],
              }
            }
          )
        },
      }
    )
  )

  const attendee = getAttendee(attendance, user)

  useEffect(() => {
    // This can maybe be enabled, but I don't trust it because it will create lots of spam calls to the server
    // right before even open (as if we don't have enough already)
    // const attendanceEventDateTimes = [attendance.registerStart, attendance.registerEnd, attendance.deregisterDeadline, attendee?.paymentDeadline]
    const attendanceEventDateTimes = [attendee?.paymentDeadline]
    setCloseToEvent(
      attendanceEventDateTimes.some((date) => date && Math.abs(differenceInSeconds(date, new Date())) < 60)
    )
    // }, [attendance, attendee])
  }, [attendee])

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

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const registerForAttendance = () => {
    registerMutation.mutate({ attendanceId: attendance.id })
  }
  const deregisterForAttendance = () => {
    deregisterMutation.mutate({ attendanceId: attendance.id })
  }

  const isLoading = attendanceLoading || punishmentLoading || deregisterMutation.isPending || registerMutation.isPending

  const hasPunishment = punishment && (punishment.delay > 0 || punishment.suspended)

  if (isBefore(getCurrentUTC(), attendance.registerStart)) {
    setTimeout(() => {
      setAttendanceStatus("Open")
    }, attendance.registerStart.getTime() - new Date().getTime())
  }

  return (
    <section className="flex flex-col gap-4 min-h-[6rem] rounded-lg sm:border sm:border-gray-200 sm:dark:border-stone-900 sm:dark:bg-stone-900 sm:p-4 sm:rounded-xl">
      <Title element="h2" size="lg">
        Påmelding
      </Title>

      <AttendanceDateInfo attendance={attendance} />

      {punishment && hasPunishment && !attendee && <PunishmentBox punishment={punishment} />}

      <MainPoolCard attendance={attendance} user={user} />

      {attendee?.reserved && attendance.selections.length > 0 && (
        <div className="flex flex-col gap-2">
          <Title element="p" size="sm" className="text-base">
            Valg
          </Title>

          <SelectionsForm
            attendance={attendance}
            attendee={attendee}
            onSubmit={handleSelectionChange}
            disabled={attendanceStatus === "Closed"}
          />
        </div>
      )}

      <NonAttendablePoolsBox attendance={attendance} user={user} />

      <div className="flex flex-col gap-4 sm:flex-row">
        {attendee?.reserved && <TicketButton attendee={attendee} />}

        <ViewAttendeesButton
          attendance={attendance}
          user={user}
          attendeeListOpen={attendeeListOpen}
          setAttendeeListOpen={setAttendeeListOpen}
        />
      </div>

      <RegistrationButton
        registerForAttendance={registerForAttendance}
        unregisterForAttendance={deregisterForAttendance}
        attendance={attendance}
        parentAttendance={parentAttendance}
        punishment={punishment}
        user={user}
        isLoading={isLoading}
      />

      <PaymentCard attendance={attendance} attendee={attendee} />

      <div className="flex flex-row flex-wrap gap-4 text-gray-800 hover:text-black dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
        <div className="flex flex-row gap-1 items-center cursor-pointer">
          <Icon icon="tabler:book-2" className="text-lg" />
          <Text className="text-sm">Arrangementregler</Text>
        </div>

        <Link href="/innstillinger/profil" className="flex flex-row gap-1 items-center">
          <Icon icon="tabler:edit" className="text-lg" />
          <Text className="text-sm">Oppdater matallergier</Text>
        </Link>

        {attendance.attendancePrice && <PaymentExplanationDialog />}
      </div>
    </section>
  )
}

export const AttendanceCardSkeleton = () => {
  const skeletonText = (heightAndWidth: string) => (
    <div className={cn("h-4 bg-gray-300 dark:bg-stone-700 rounded-full animate-pulse", heightAndWidth)} />
  )

  const dateInfo = () => (
    <div className="flex flex-col gap-1 w-[25%]">
      {skeletonText("w-[80%] h-5")}
      {skeletonText("w-[90%] h-5")}
    </div>
  )

  const title = skeletonText("w-[50%] h-8")
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
