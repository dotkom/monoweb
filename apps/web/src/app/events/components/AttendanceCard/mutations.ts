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

        await queryClient.invalidateQueries(trpc.attendance.getAttendance.queryOptions({ id: input.attendanceId }))
        await queryClient.invalidateQueries(
          trpc.attendance.getAttendees.queryOptions({ attendanceId: input.attendanceId })
        )
      },
      onError: (error) => {
        console.error(error)
      },
    })
  )
}

interface UseRegisterMutationInput {
  onSuccess?: () => void
}

export const useRegisterMutation = ({ onSuccess }: UseRegisterMutationInput) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const mutation = useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onSuccess: async (data) => {
        queryClient.invalidateQueries(trpc.attendance.getAttendees.queryOptions({ attendanceId: data.attendanceId }))
        queryClient.invalidateQueries(trpc.attendance.getAttendance.queryOptions({ id: data.attendanceId }))

        onSuccess?.()
      },
      onError: (error) => {
        console.error(error)
      },
    })
  )

  return mutation
}
