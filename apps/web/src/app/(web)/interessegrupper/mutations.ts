import { useTRPC } from "@/utils/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useStartInterestGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.group.startInterestGroupMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.group.allMembershipsByUserId.queryKey() })
      },
    })
  )
}

export const useEndInterestGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.group.endInterestGroupMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.group.allMembershipsByUserId.queryKey() })
      },
    })
  )
}

export const useRegisterForInterestGroupEvent = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.interestGroupEvent.createRegistration.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findMany.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({ queryKey: trpc.interestGroupEvent.findById.queryKey() })
      },
    })
  )
}

export const useUnregisterFromInterestGroupEvent = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.interestGroupEvent.deleteRegistration.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findMany.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({ queryKey: trpc.interestGroupEvent.findById.queryKey() })
      },
    })
  )
}
