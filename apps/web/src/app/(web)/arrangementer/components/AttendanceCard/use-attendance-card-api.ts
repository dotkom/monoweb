"use client"

import { useTRPCSSERegisterChangeConnectionState } from "@/utils/trpc/QueryProvider"
import { useTRPC } from "@/utils/trpc/client"
import type { AttendanceRouter } from "@dotkomonline/rpc"
import { type Attendance, type AttendanceSelectionResponse, getAttendee } from "@dotkomonline/rpc/attendance"
import type { User } from "@dotkomonline/rpc/user"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import { differenceInSeconds, secondsToMilliseconds } from "date-fns"
import { useEffect, useState } from "react"
import type { DeregisterReasonFormResult } from "../DeregisterModal"
import { useDeregisterMutation, useRegisterMutation, useSetSelectionsOptionsMutation } from "../mutations"
import { patchAttendanceFromRegisterChange } from "./patchAttendanceFromRegisterChange"
import { patchRegistrationAvailabilityFromPoolOccupancies } from "./patchRegistrationAvailabilityFromPoolOccupancies"

interface UseAttendanceCardApiOptions {
  initialAttendance: Attendance
  initialRegistrationAvailability: AttendanceRouter.GetRegistrationAvailabilityOutput | null
  user: User | null
  onDeregisterSuccess: () => void
}

export const useAttendanceCardApi = ({
  initialAttendance,
  initialRegistrationAvailability,
  user,
  onDeregisterSuccess,
}: UseAttendanceCardApiOptions) => {
  const trpcClient = useTRPC()
  const queryClient = useQueryClient()
  const { setTRPCSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()
  const [isCloseToEvent, setIsCloseToEvent] = useState(false)

  const { data: attendance } = useQuery(
    trpcClient.event.attendance.getAttendance.queryOptions(
      {
        id: initialAttendance.id,
      },
      {
        initialData: initialAttendance,
        enabled: Boolean(user),
        refetchInterval: isCloseToEvent ? secondsToMilliseconds(1) : secondsToMilliseconds(60),
      }
    )
  )

  const { data: registrationAvailability } = useQuery(
    trpcClient.event.attendance.getRegistrationAvailability.queryOptions(
      {
        attendanceId: initialAttendance.id,
      },
      {
        initialData: initialRegistrationAvailability ?? undefined,
        enabled: Boolean(user),
      }
    )
  )

  useSubscription(
    trpcClient.event.attendance.onRegisterChange.subscriptionOptions(
      {
        attendanceId: initialAttendance.id,
      },
      {
        onConnectionStateChange: (state) => {
          setTRPCSSERegisterChangeConnectionState(state.state)
        },
        onData: ({ status, attendee: updatedAttendee, poolOccupancies }) => {
          queryClient.setQueryData(
            trpcClient.event.attendance.getAttendance.queryOptions({ id: attendance?.id }).queryKey,
            (oldData) => patchAttendanceFromRegisterChange(oldData, { status, attendee: updatedAttendee })
          )

          if (user && updatedAttendee.userId === user.id) {
            void queryClient.invalidateQueries(
              trpcClient.event.attendance.getRegistrationAvailability.queryOptions({
                attendanceId: initialAttendance.id,
              })
            )

            return
          }

          if (!user) {
            return
          }

          const queryOptions = trpcClient.event.attendance.getRegistrationAvailability.queryOptions({
            attendanceId: initialAttendance.id,
          })

          queryClient.setQueryData(queryOptions.queryKey, (oldData) =>
            patchRegistrationAvailabilityFromPoolOccupancies(oldData, poolOccupancies)
          )
        },
      }
    )
  )

  const attendee = getAttendee(attendance, user)

  useEffect(() => {
    const attendanceEventDateTimes = [
      registrationAvailability?.completion?.completionDeadline ?? attendee?.completionDeadline ?? null,
    ]
    setIsCloseToEvent(
      attendanceEventDateTimes.some((date) => date && Math.abs(differenceInSeconds(date, new Date())) < 60)
    )
  }, [attendee, registrationAvailability?.completion?.completionDeadline])

  const invalidateRegistrationAvailability = () => {
    if (!user) {
      return
    }

    void queryClient.invalidateQueries(
      trpcClient.event.attendance.getRegistrationAvailability.queryOptions({
        attendanceId: attendance.id,
      })
    )
  }

  const registerMutation = useRegisterMutation({ onSuccess: invalidateRegistrationAvailability })
  const deregisterMutation = useDeregisterMutation({ onSuccess: invalidateRegistrationAvailability })
  const selectionsMutation = useSetSelectionsOptionsMutation()

  const registerForAttendance = (turnstileToken: string) => {
    registerMutation.mutate({ attendanceId: attendance.id, turnstileToken })
  }

  const deregisterForAttendance = (deregisterReason: DeregisterReasonFormResult | null) => {
    deregisterMutation.mutate(
      { attendanceId: attendance.id, deregisterReason: deregisterReason ?? undefined },
      { onSuccess: onDeregisterSuccess }
    )
  }

  const setSelectionOptions = (selections: AttendanceSelectionResponse[]) => {
    if (!attendee) {
      return
    }

    selectionsMutation.mutate({
      attendeeId: attendee.id,
      options: selections,
    })
  }

  return {
    attendance,
    registrationAvailability,
    registerForAttendance,
    deregisterForAttendance,
    setSelectionOptions,
    isRegisterActionPending: registerMutation.isPending || deregisterMutation.isPending,
  }
}
