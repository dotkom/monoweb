import { trpc } from "@/utils/trpc/client"

export const useDeregisterMutation = () => {
  const utils = trpc.useUtils()

  return trpc.event.attendance.deregisterForEvent.useMutation({
    onSuccess: async (_, input) => {
      await utils.attendance.getAttendance.invalidate({ id: input.attendanceId })
      await utils.attendance.getAttendee.invalidate({ attendanceId: input.attendanceId })
    },
    onError: (error) => {
      console.error(error)
    },
  })
}

interface UseRegisterMutationInput {
  onSuccess?: () => void
}

export const useRegisterMutation = ({ onSuccess }: UseRegisterMutationInput) => {
  const utils = trpc.useUtils()

  const mutation = trpc.event.attendance.registerForEvent.useMutation({
    onSuccess: async (_, input) => {
      await utils.attendance.getAttendance.invalidate({ id: input.attendanceId })
      await utils.attendance.getAttendee.invalidate({ attendanceId: input.attendanceId })

      onSuccess?.()
    },
    onError: (error) => {
      console.error(error)
    },
  })

  return mutation
}
