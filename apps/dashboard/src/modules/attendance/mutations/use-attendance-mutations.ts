import { useQueryGenericMutationNotification } from "../../../app/notifications"
import { trpc } from "../../../trpc"

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
    method: "update",
  })

  return trpc.event.attendance.updateAttendance.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}

export const useMergeAttendanceMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return trpc.event.attendance.mergeAttendance.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}

export const useUpdateExtrasMutation = () => {
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return trpc.event.attendance.updateExtras.useMutation({
    onError: fail,
    onMutate: loading,
    onSuccess: complete,
  })
}
