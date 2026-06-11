import { useTRPCSSERegisterChangeConnectionState } from "@/utils/trpc/QueryProvider"
import { useTRPC } from "@/utils/trpc/client"
import { useUser } from "@auth0/nextjs-auth0/client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeregisterMutation = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const trpc = useTRPC()
  const { trpcSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()
  const queryClient = useQueryClient()
  const { user } = useUser()

  return useMutation(
    trpc.event.attendance.deregisterForEvent.mutationOptions({
      onSuccess: async (_, input) => {
        if (!user) {
          return
        }

        if (trpcSSERegisterChangeConnectionState !== "pending") {
          await queryClient.invalidateQueries(
            trpc.event.attendance.getAttendance.queryOptions({ id: input.attendanceId })
          )
        }

        onSuccess?.()
      },
    })
  )
}

interface UseRegisterMutationInput {
  onSuccess?: () => void
}

export const useRegisterMutation = ({ onSuccess }: UseRegisterMutationInput = {}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { trpcSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()

  return useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onSuccess: async (data) => {
        // Check if the connection is not open (connecting or idle)
        if (trpcSSERegisterChangeConnectionState !== "pending") {
          await Promise.all([
            queryClient.invalidateQueries(trpc.event.attendance.getAttendance.queryOptions({ id: data.attendanceId })),
          ])
        }

        onSuccess?.()
      },
    })
  )
}

export const useSetSelectionsOptionsMutation = () => {
  const trpc = useTRPC()

  return useMutation(trpc.event.attendance.updateSelectionResponses.mutationOptions({}))
}
