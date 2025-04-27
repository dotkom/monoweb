import { useQueryGenericMutationNotification } from "@/notifications"
import { useTRPC } from "@/trpc"
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
