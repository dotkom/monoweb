import { useQueryGenericMutationNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUpdateUserMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.user.update.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.user.get.queryOptions(data.id))
        await queryClient.invalidateQueries(trpc.user.all.queryOptions())
      },
    })
  )
}

export const useCreateMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.user.createMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.user.get.queryOptions(data.id))
      },
    })
  )
}

export const useUpdateMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.user.updateMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.user.get.queryOptions(data.id))
      },
    })
  )
}
