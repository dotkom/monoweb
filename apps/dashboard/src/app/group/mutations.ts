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

export const useStartGroupMembershipMutation = () => {
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

        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(input.groupId))
        await queryClient.invalidateQueries(
          trpc.group.getMember.queryOptions({ groupId: input.groupId, userId: input.userId })
        )
      },
    })
  )
}

export const useEndGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return useMutation(
    trpc.group.endMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(input.groupId))
        await queryClient.invalidateQueries(
          trpc.group.getMember.queryOptions({ groupId: input.groupId, userId: input.userId })
        )
      },
    })
  )
}

export const useUpdateGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.group.updateMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(data.groupId))
        await queryClient.invalidateQueries(
          trpc.group.getMember.queryOptions({ groupId: data.groupId, userId: data.userId })
        )
      },
    })
  )
}
