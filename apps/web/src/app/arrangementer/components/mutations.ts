import { useTRPC } from "@/utils/trpc/client"
import { useSession } from "@dotkomonline/oauth2/react"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeregisterMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const session = useSession()

  return useMutation(
    trpc.event.attendance.deregisterForEvent.mutationOptions({
      onSuccess: async (_, input) => {
        if (!session) {
          return
        }

        await Promise.all([
          await queryClient.invalidateQueries(trpc.attendance.getAttendance.queryOptions({ id: input.attendanceId })),
        ])
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

  return useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.attendance.getAttendance.queryOptions({ id: data.attendanceId })),
        ])

        onSuccess?.()
      },
    })
  )
}

export const useSetSelectionsOptionsMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(trpc.attendance.updateSelectionResponses.mutationOptions({}))
}
