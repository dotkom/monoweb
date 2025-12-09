import { useSession } from "@dotkomonline/oauth2/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/utils/trpc/client"
import { useTRPCSSERegisterChangeConnectionState } from "@/utils/trpc/QueryProvider"

export const useDeregisterMutation = () => {
  const trpc = useTRPC()
  const { trpcSSERegisterChangeConnectionState } = useTRPCSSERegisterChangeConnectionState()
  const queryClient = useQueryClient()
  const session = useSession()

  return useMutation(
    trpc.event.attendance.deregisterForEvent.mutationOptions({
      onSuccess: async (_, input) => {
        if (!session) {
          return
        }

        // Check if the connection is not open (connecting or idle)
        if (trpcSSERegisterChangeConnectionState !== "pending") {
          await Promise.all([
            await queryClient.invalidateQueries(
              trpc.event.attendance.getAttendance.queryOptions({ id: input.attendanceId })
            ),
          ])
        }
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
