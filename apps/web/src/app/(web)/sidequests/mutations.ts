import { useTRPC } from "@/utils/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useStartInterestGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.group.startInterestGroupMembership.mutationOptions({
      onSuccess: async (_, input) => {
        await queryClient.invalidateQueries({ queryKey: trpc.group.allMembershipsByUserId.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.group.getMembers.queryKey(input) })
      },
    })
  )
}

export const useEndInterestGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.group.endInterestGroupMembership.mutationOptions({
      onSuccess: async (_, input) => {
        await queryClient.invalidateQueries({ queryKey: trpc.group.allMembershipsByUserId.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.group.getMembers.queryKey(input) })
      },
    })
  )
}

export const useRegisterForSidequest = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.sidequest.createRegistration.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findMany.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({ queryKey: trpc.sidequest.findById.queryKey() })
      },
    })
  )
}

export const useUnregisterFromSidequest = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.sidequest.deleteRegistration.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findMany.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({ queryKey: trpc.sidequest.findById.queryKey() })
      },
    })
  )
}
