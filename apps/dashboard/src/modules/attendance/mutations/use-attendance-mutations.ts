import { useQueryGenericMutationNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useAddAttendanceMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return trpc.event.addAttendance.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}

export const useUpdateAttendanceMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return trpc.event.attendance.updateAttendance.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}
