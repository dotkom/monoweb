import { useQueryGenericMutationNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateGroupRoleMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.group.createRole.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.get.queryOptions(input.groupId))
      },
    })
  )
}

export const useUpdateGroupRoleMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.group.updateRole.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.get.queryOptions(data.groupId))
      },
    })
  )
}

export const useStartMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.group.startMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.get.queryOptions(input.data.groupId))
        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(input.data.groupId))
        await queryClient.invalidateQueries(
          trpc.group.getMember.queryOptions({ groupId: input.data.groupId, userId: input.data.userId })
        )
      },
    })
  )
}

export const useEndMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.group.endMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.get.queryOptions(input.groupId))
        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(input.groupId))
        await queryClient.invalidateQueries(
          trpc.group.getMember.queryOptions({ groupId: input.groupId, userId: input.userId })
        )
      },
    })
  )
}
