import { trpc } from "@/utils/trpc/client"

export const useUnregisterMutation = () => {
  const utils = trpc.useUtils()
  return trpc.event.attendance.deregisterForEvent.useMutation({
    onSuccess: () => {
      utils.event.getWebEventDetailData.invalidate()
      utils.event.attendance.getAttendee.invalidate()
    },
    onError: (error) => {
      console.error(error)
    },
  })
}

export const useRegisterMutation = () => {
  const utils = trpc.useUtils()

  const mutation = trpc.event.attendance.registerForEvent.useMutation({
    onSuccess: () => {
      utils.event.getWebEventDetailData.invalidate()
      utils.event.attendance.getAttendee.invalidate()
    },
    onError: (error) => {
      console.error(error)
    },
  })

  return mutation
}
