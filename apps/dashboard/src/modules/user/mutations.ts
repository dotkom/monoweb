import { useQueryGenericMutationNotification } from "../../app/notifications"
import { trpc } from "../../utils/trpc"

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

export const useDeleteUserMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return trpc.user.delete.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}
