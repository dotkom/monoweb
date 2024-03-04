import { useQueryGenericMutationNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useDeletePoolMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return trpc.event.attendance.deletePool.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}

export const useCreatePoolMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return trpc.event.attendance.createPool.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}

export const useUpdatePoolMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return trpc.event.attendance.updatePool.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}
