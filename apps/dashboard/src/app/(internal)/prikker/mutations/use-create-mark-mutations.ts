import { useQueryGenericMutationNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateMarkMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.mark.create.mutationOptions({
      onMutate: () => {
        loading()
      },
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries({ queryKey: trpc.mark.findMany.queryKey() })
        router.push(`/prikker/${data.id}`)
      },
      onError: (err) => {
        fail(err)
      },
    })
  )
}
