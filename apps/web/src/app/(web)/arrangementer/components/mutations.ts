import { useTRPCSSERegisterChangeConnectionState } from "@/utils/trpc/QueryProvider"
import { useTRPC } from "@/utils/trpc/client"
import { useUser } from "@auth0/nextjs-auth0/client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

interface UseAttendanceMutationOptions {
  onSuccess?: () => void
  isSSEConnected?: boolean
}

export const useDeregisterMutation = ({ onSuccess, isSSEConnected }: UseAttendanceMutationOptions = {}) => {
  const trpc = useTRPC()
  const { trpcSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()
  const queryClient = useQueryClient()
  const { user } = useUser()

  const isSSEPending = trpcSSERegisterChangeConnectionState === "pending"
  const isSSEConnectedOrPending = isSSEConnected ?? isSSEPending

  return useMutation(
    trpc.event.attendance.deregisterForEvent.mutationOptions({
      onSuccess: async (_, input) => {
        if (!user) {
          return
        }

        if (!isSSEConnectedOrPending) {
          await queryClient.invalidateQueries(
            trpc.event.attendance.getAttendance.queryOptions({ id: input.attendanceId })
          )
        }

        onSuccess?.()
      },
    })
  )
}

export const useRegisterMutation = ({ onSuccess, isSSEConnected }: UseAttendanceMutationOptions = {}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { trpcSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()

  const isSSEPending = trpcSSERegisterChangeConnectionState === "pending"
  const isSSEConnectedOrPending = isSSEConnected ?? isSSEPending

  return useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onSuccess: async (data) => {
        // Check if the connection is not open (connecting or idle)
        if (!isSSEConnectedOrPending) {
          await Promise.all([
            queryClient.invalidateQueries(trpc.event.attendance.getAttendance.queryOptions({ id: data.attendanceId })),
          ])
        }

        onSuccess?.()
      },
    })
  )
}

interface UseSetSelectionsOptionsMutationInput {
  attendanceId: string
}

export const useSetSelectionsOptionsMutation = ({ attendanceId }: UseSetSelectionsOptionsMutationInput) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.event.attendance.updateSelectionResponses.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.event.attendance.getAttendance.queryOptions({ id: attendanceId })),
          queryClient.invalidateQueries(
            trpc.event.attendance.getRegistrationAvailability.queryOptions({ attendanceId })
          ),
        ])
      },
    })
  )
}
