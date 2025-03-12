import { useTRPC } from "@/utils/trpc/client"

import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

export const useUnregisterMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  return useMutation(
    trpc.event.attendance.deregisterForEvent.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.refetchQueries(trpc.event.getWebEventDetailData.queryFilter()),
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

  const mutation = useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.refetchQueries(trpc.event.getWebEventDetailData.queryFilter()),
          queryClient.refetchQueries(trpc.event.attendance.getAttendee.queryFilter()),
        ])
        onSuccess()
      },
      onError: (error) => {
        console.error(error)
      },
    })
  )

  return mutation
}

export const useSetExtrasChoicesMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.event.attendance.setExtrasChoices.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.event.getWebEventDetailData.queryFilter())
      },
      onError: (error) => {
        alert("Noe gikk galt")
        console.error(error)
      },
    })
  )
}
