import { useQueryGenericMutationNotification } from "../../app/notifications"
import { trpc } from "../../trpc"

export const useUpdateUserMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return trpc.user.update.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}
