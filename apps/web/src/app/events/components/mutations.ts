import { useTRPC } from "@/utils/trpc/client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUnregisterMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  return useMutation(
    trpc.event.attendance.deregisterForEvent.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.refetchQueries(trpc.event.getAttendanceEventDetail.queryFilter()),
          queryClient.refetchQueries(trpc.event.attendance.getAttendee.queryFilter()),
        ])
      },
      onError: (error) => {
        console.error(error)
      },
    })
  )
}

interface UseRegisterMutationInput {
  onSuccess: () => void
}

export const useRegisterMutation = ({ onSuccess }: UseRegisterMutationInput) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.refetchQueries(trpc.event.getAttendanceEventDetail.queryFilter()),
          queryClient.refetchQueries(trpc.event.attendance.getAttendee.queryFilter()),
        ])
        onSuccess()
      },
      onError: (error) => {
        console.error(error)
      },
    })
  )
}

export const useSetSelectionsOptionsMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.event.attendance.updateSelectionResponses.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.event.getAttendanceEventDetail.queryFilter())
      },
      onError: (error) => {
        alert("Noe gikk galt")
        console.error(error)
      },
    })
  )
}
