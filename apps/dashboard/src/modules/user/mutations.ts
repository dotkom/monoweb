import { useQueryGenericMutationNotification } from "../../app/notifications"
import { useTRPC } from "../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useUpdateUserMutation = () => {
  const trpc = useTRPC()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.user.update.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: complete,
    })
  )
}
