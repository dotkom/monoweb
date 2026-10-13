"use client"

import { useTRPCSSERegisterChangeConnectionState } from "@/utils/trpc/QueryProvider"
import { useTRPC } from "@/utils/trpc/client"
import { useDeadlineTick } from "@/utils/use-deadline-tick"
import type { AttendanceRouter } from "@dotkomonline/rpc"
import { type Attendance, type AttendanceSelectionResponse, getAttendee } from "@dotkomonline/rpc/attendance"
import type { User } from "@dotkomonline/rpc/user"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import { differenceInSeconds, secondsToMilliseconds } from "date-fns"
import { useEffect } from "react"
import type { DeregisterReasonFormResult } from "../DeregisterModal"
import { useDeregisterMutation, useRegisterMutation, useSetSelectionsOptionsMutation } from "../mutations"
import { patchAttendanceFromRegisterChange } from "./patchAttendanceFromRegisterChange"
import { patchRegistrationAvailabilityFromPoolOccupancies } from "./patchRegistrationAvailabilityFromPoolOccupancies"
import { attendanceCardQueryOptions } from "./attendanceCardQueryOptions"
import {
  getAttendanceCardRegistrationAvailability,
  getDeregisterGracePeriodEnd,
} from "./getAttendanceCardRegistrationAvailability"

interface UseAttendanceCardApiOptions {
  initialAttendance: Attendance
  initialRegistrationAvailability: AttendanceRouter.GetRegistrationAvailabilityOutput | null
  user: User | null
  onDeregisterSuccess: () => void
  bulkSubscription?: { isConnected: boolean }
}

export const useAttendanceCardApi = ({
  initialAttendance,
  initialRegistrationAvailability,
  user,
  onDeregisterSuccess,
  bulkSubscription,
}: UseAttendanceCardApiOptions) => {
  const trpcClient = useTRPC()
  const queryClient = useQueryClient()
  const { setTRPCSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()

  const { data: attendance } = useQuery({
    ...attendanceCardQueryOptions(trpcClient, initialAttendance.id),
    initialData: initialAttendance,
    enabled: Boolean(user) || bulkSubscription !== undefined,
    refetchInterval: (query) => {
      const completionDeadline = getAttendee(query.state.data ?? initialAttendance, user)?.completionDeadline
      const isCloseToDeadline =
        completionDeadline != null && Math.abs(differenceInSeconds(completionDeadline, new Date())) < 60

      return secondsToMilliseconds(isCloseToDeadline ? 1 : 60)
    },
  })

  const { data: cachedRegistrationAvailability } = useQuery(
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

  const subscription = useSubscription(
    trpcClient.event.attendance.onRegisterChange.subscriptionOptions(
      {
        attendanceId: initialAttendance.id,
      },
      {
        enabled: bulkSubscription === undefined,
        onConnectionStateChange: (state) => {
          setTRPCSSERegisterChangeConnectionState(state.state)
        },
        onData: ({ status, attendee: updatedAttendee, poolOccupancies }) => {
          queryClient.setQueryData(attendanceCardQueryOptions(trpcClient, initialAttendance.id).queryKey, (oldData) =>
            patchAttendanceFromRegisterChange(oldData, { status, attendee: updatedAttendee })
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
  const registrationAvailability = getAttendanceCardRegistrationAvailability(
    attendance,
    attendee,
    cachedRegistrationAvailability
  )
  const deadlineTick = useDeadlineTick(
    attendance.registerStart,
    attendance.registerEnd,
    attendance.deregisterDeadline,
    cachedRegistrationAvailability?.deregistration?.chargeScheduleDate,
    getDeregisterGracePeriodEnd(attendee),
    attendee?.completionDeadline
  )

  useEffect(() => {
    if (!user || deadlineTick === 0) {
      return
    }

    void queryClient.invalidateQueries(
      trpcClient.event.attendance.getRegistrationAvailability.queryOptions({ attendanceId: initialAttendance.id })
    )
  }, [deadlineTick, initialAttendance.id, queryClient, trpcClient, user])

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

  const isSSEConnected = bulkSubscription?.isConnected ?? subscription.status === "pending"

  const registerMutation = useRegisterMutation({
    onSuccess: invalidateRegistrationAvailability,
    isSSEConnected,
  })

  const deregisterMutation = useDeregisterMutation({
    onSuccess: invalidateRegistrationAvailability,
    isSSEConnected,
  })

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
