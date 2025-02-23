import { trpc } from "@/utils/trpc/client"

export const useUnregisterMutation = () => {
  const utils = trpc.useUtils()
  return trpc.event.attendance.deregisterForEvent.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.event.getAttendanceEventDetail.refetch(), utils.event.attendance.getAttendee.refetch()])
    },
    onError: (error) => {
      console.error(error)
    },
  })
}

interface UseRegisterMutationInput {
  onSuccess: () => void
}

export const useRegisterMutation = ({ onSuccess }: UseRegisterMutationInput) => {
  const utils = trpc.useUtils()

  const mutation = trpc.event.attendance.registerForEvent.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.event.getAttendanceEventDetail.refetch(), utils.event.attendance.getAttendee.refetch()])
      onSuccess()
    },
    onError: (error) => {
      console.error(error)
    },
  })

  return mutation
}

export const useSetSelectionsOptionsMutation = () => {
  const utils = trpc.useUtils()

  return trpc.event.attendance.updateSelectionResponses.useMutation({
    onSuccess: () => {
      utils.event.getAttendanceEventDetail.invalidate()
    },
    onError: (error) => {
      alert("Noe gikk galt")
      console.error(error)
    },
  })
}
