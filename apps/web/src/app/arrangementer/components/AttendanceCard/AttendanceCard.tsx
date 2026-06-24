"use client"

import { env } from "@/env"
import { useTRPCSSERegisterChangeConnectionState } from "@/utils/trpc/QueryProvider"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import type { AttendanceRouter } from "@dotkomonline/rpc"
import { type Attendance, type AttendanceSelectionResponse, getAttendee } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import type { User } from "@dotkomonline/rpc/user"
import { Text, Title, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl, getCurrentUTC } from "@dotkomonline/utils"
import { IconEdit } from "@tabler/icons-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import { differenceInSeconds, isBefore, isPast, secondsToMilliseconds } from "date-fns"
import Link from "next/link"
import Turnstile from "react-turnstile"
import { useEffect, useState } from "react"
import type { DeregisterReasonFormResult } from "../DeregisterModal"
import { getAttendanceStatus } from "../attendanceStatus"
import { useDeregisterMutation, useRegisterMutation, useSetSelectionsOptionsMutation } from "./../mutations"
import { AttendanceDateInfo } from "./AttendanceDateInfo"
import { EventRules } from "./EventRules"
import { MainPoolCard } from "./MainPoolCard"
import { NonAttendablePoolsBox } from "./NonAttendablePoolsBox"
import { PaymentExplanationDialog } from "./PaymentExplanationDialog"
import { PunishmentBox } from "./PunishmentBox"
import { RegistrationButton } from "./RegistrationButton"
import { patchRegistrationAvailabilityFromPoolOccupancies } from "./patchRegistrationAvailabilityFromPoolOccupancies"
import { SelectionsForm } from "./SelectionsForm"
import { TicketButton } from "./TicketButton"
import { ViewAttendeesButton } from "./ViewAttendeesButton"

type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

interface AttendanceCardProps {
  initialAttendance: Attendance
  initialRegistrationAvailability: RegistrationAvailability | null
  user: User | null
  event: Event
  parentEvent: Event | null
}

export const AttendanceCard = ({
  user,
  event,
  initialAttendance,
  initialRegistrationAvailability,
}: AttendanceCardProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { setTRPCSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()

  const fullPathname = useFullPathname()
  const authorizeUrl = createAuthorizeUrl({ returnTo: fullPathname })

  const [closeToEvent, setCloseToEvent] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState(getAttendanceStatus(initialAttendance))
  const [turnstileHasLoaded, setTurnstileHasLoaded] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [hideTurnstile, setHideTurnstile] = useState(false)

  const { data: attendance, isLoading: attendanceLoading } = useQuery(
    trpc.event.attendance.getAttendance.queryOptions(
      {
        id: initialAttendance.id,
      },
      {
        initialData: initialAttendance,
        enabled: Boolean(user),
        refetchInterval: closeToEvent ? secondsToMilliseconds(1) : secondsToMilliseconds(60),
      }
    )
  )

  const { data: registrationAvailability, isLoading: registrationAvailabilityLoading } = useQuery(
    trpc.event.attendance.getRegistrationAvailability.queryOptions(
      {
        attendanceId: initialAttendance.id,
      },
      {
        initialData: initialRegistrationAvailability ?? undefined,
        enabled: Boolean(user),
      }
    )
  )

  useEffect(() => {
    if (attendance) {
      setAttendanceStatus(getAttendanceStatus(attendance))
    }
  }, [attendance])

  useEffect(() => {
    if (turnstileToken) {
      setTimeout(() => {
        setHideTurnstile(true)
      }, 1500)
    } else {
      setHideTurnstile(false)
    }
  }, [turnstileToken])

  useSubscription(
    trpc.event.attendance.onRegisterChange.subscriptionOptions(
      {
        attendanceId: attendance?.id ?? "",
      },
      {
        onConnectionStateChange: (state) => {
          setTRPCSSERegisterChangeConnectionState(state.state)
        },
        onData: ({ status, attendee: updatedAttendee, poolOccupancies }) => {
          queryClient.setQueryData(
            trpc.event.attendance.getAttendance.queryOptions({ id: attendance?.id }).queryKey,
            (oldData) => {
              if (!oldData) {
                return oldData
              }

              if (status === "deregistered") {
                return {
                  ...oldData,
                  attendees: oldData.attendees.filter((oldAttendee) => oldAttendee.id !== updatedAttendee.id),
                }
              }

              if (status === "reserved") {
                return {
                  ...oldData,
                  attendees: oldData.attendees.map((oldAttendee) => {
                    if (oldAttendee.id === updatedAttendee.id) {
                      return updatedAttendee
                    }

                    return oldAttendee
                  }),
                }
              }

              if (oldData.attendees.some((oldAttendee) => oldAttendee.id === updatedAttendee.id)) {
                console.warn("Attendee already exists in the list, not updating state.")
                return oldData
              }

              return {
                ...oldData,
                attendees: [...oldData.attendees, updatedAttendee],
              }
            }
          )

          if (user && updatedAttendee.userId === user.id) {
            void queryClient.invalidateQueries(
              trpc.event.attendance.getRegistrationAvailability.queryOptions({
                attendanceId: attendance?.id ?? "",
              })
            )

            return
          }

          if (!user) {
            return
          }

          const queryOptions = trpc.event.attendance.getRegistrationAvailability.queryOptions({
            attendanceId: attendance?.id ?? "",
          })

          queryClient.setQueryData(queryOptions.queryKey, (oldData) =>
            patchRegistrationAvailabilityFromPoolOccupancies(oldData, poolOccupancies)
          )
        },
      }
    )
  )

  const attendee = getAttendee(attendance, user)
  const punishment = registrationAvailability?.punishment ?? null
  const chargeScheduleDate = registrationAvailability?.deregistration?.chargeScheduleDate ?? null

  useEffect(() => {
    const attendanceEventDateTimes = [attendee?.paymentDeadline]
    setCloseToEvent(
      attendanceEventDateTimes.some((date) => date && Math.abs(differenceInSeconds(date, new Date())) < 60)
    )
  }, [attendee])

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const registerMutation = useRegisterMutation({
    onSuccess: () => {
      if (!user) {
        return
      }

      void queryClient.invalidateQueries(
        trpc.event.attendance.getRegistrationAvailability.queryOptions({
          attendanceId: attendance.id,
        })
      )
    },
  })

  const deregisterMutation = useDeregisterMutation({
    onSuccess: () => {
      if (!user) {
        return
      }

      void queryClient.invalidateQueries(
        trpc.event.attendance.getRegistrationAvailability.queryOptions({
          attendanceId: attendance.id,
        })
      )
    },
  })

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

  const registerForAttendance = () => {
    if (!turnstileToken) {
      console.error("No turnstile token, cannot register")
      return
    }
    registerMutation.mutate({ attendanceId: attendance.id, turnstileToken })
  }

  const deregisterForAttendance = (deregisterReason: DeregisterReasonFormResult | null) => {
    deregisterMutation.mutate(
      { attendanceId: attendance.id, deregisterReason: deregisterReason ?? undefined },
      { onSuccess: () => setTurnstileToken(null) }
    )
  }

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token)
  }

  const handleTurnstileError = (error: string) => {
    console.error("Turnstile error:", error)
    setTurnstileToken(null)
  }

  const isLoading =
    attendanceLoading || registrationAvailabilityLoading || deregisterMutation.isPending || registerMutation.isPending

  const hasPunishment = punishment !== null && (punishment.delay > 0 || punishment.suspended)

  if (isBefore(getCurrentUTC(), attendance.registerStart)) {
    setTimeout(() => {
      setAttendanceStatus("OPEN")
    }, attendance.registerStart.getTime() - Date.now())
  }

  return (
    <section className="flex flex-col gap-4 min-h-[6rem] sm:p-4 sm:rounded-xl sm:border sm:border-gray-200 sm:dark:border-stone-800 sm:dark:bg-stone-800">
      <Title element="h2" size="lg">
        Påmelding
      </Title>

      <AttendanceDateInfo attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />

      {punishment && hasPunishment && !attendee && <PunishmentBox punishment={punishment} />}

      <MainPoolCard
        attendance={attendance}
        user={user}
        authorizeUrl={authorizeUrl}
        chargeScheduleDate={chargeScheduleDate}
      />

      {attendee?.reserved && attendance.selections.length > 0 && (
        <div className="flex flex-col gap-2">
          <Title element="p" size="sm" className="text-base">
            Valg
          </Title>

          <SelectionsForm
            attendance={attendance}
            attendee={attendee}
            onSubmit={handleSelectionChange}
            disabled={attendanceStatus === "CLOSED"}
          />
        </div>
      )}

      <NonAttendablePoolsBox attendance={attendance} user={user} />

      <div className={cn("grid grid-cols-1 gap-4", attendee?.reserved && "sm:grid-cols-2")}>
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
        registrationAvailability={registrationAvailability}
        user={user}
        event={event}
        isLoading={isLoading}
        turnstileHasLoaded={turnstileHasLoaded}
        hasTurnstileToken={Boolean(turnstileToken)}
      />

      {user !== null && !attendee && !isPast(attendance.registerEnd) && (
        <div className={cn({ hidden: hideTurnstile }, "relative rounded-md bg-gray-200 dark:bg-stone-700")}>
          <Turnstile
            sitekey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            retry="auto"
            refreshExpired="auto"
            onError={handleTurnstileError}
            onVerify={handleTurnstileVerify}
            onExpire={() => setTurnstileToken(null)}
            onLoad={() => setTurnstileHasLoaded(true)}
            size="flexible"
            className="h-[4.05rem]" // Without this a padding occurs below the widget
          />
        </div>
      )}

      <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
        <EventRules className="text-gray-700 hover:text-black dark:text-stone-300 dark:hover:text-stone-100 transition-colors" />

        <Link
          href="/innstillinger/profil"
          className="flex flex-row gap-2 items-center text-gray-700 hover:text-black dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
        >
          <IconEdit className="size-[1.25em]" />
          <Text className="text-sm">Oppdater matpreferanser</Text>
        </Link>

        {attendance.attendancePrice && <PaymentExplanationDialog />}
      </div>
    </section>
  )
}

export const AttendanceCardSkeleton = () => {
  const skeletonText = (heightAndWidth: string) => (
    <div className={cn("h-4 bg-gray-300 dark:bg-stone-600 rounded-full animate-pulse", heightAndWidth)} />
  )

  const dateInfo = () => (
    <div className="flex flex-col gap-1 w-[25%]">
      {skeletonText("w-[80%] h-5")}
      {skeletonText("w-[90%] h-5")}
    </div>
  )

  const title = skeletonText("w-[50%] h-8")
  const card = <div className="min-h-[12rem] rounded-lg bg-gray-300 dark:bg-stone-600 animate-pulse" />
  const button = <div className="min-h-[4rem] rounded-lg bg-gray-300 dark:bg-stone-600 animate-pulse" />

  return (
    <section className="flex flex-col gap-4 min-h-[6rem] rounded-lg sm:border sm:border-gray-200 sm:dark:border-stone-800 sm:dark:bg-stone-800 sm:p-4 sm:rounded-xl">
      {title}

      <div className="flex flex-row gap-2 items-center">
        {dateInfo()}
        <span className="grow h-0.5 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse invisible sm:visible" />
        {dateInfo()}
        <span className="grow h-0.5 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse invisible sm:visible" />
        {dateInfo()}
      </div>

      {card}

      {button}

      {button}
    </section>
  )
}
