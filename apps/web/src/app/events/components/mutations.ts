import { trpc } from "@/utils/trpc/client"

export const useSetSelectionsOptionsMutation = () => {
  const utils = trpc.useUtils()

  return trpc.event.attendance.updateSelectionResponses.useMutation({
    onSuccess: () => {
      utils.event.getAttendanceEvent.invalidate()
    },
    onError: (error) => {
      alert("Noe gikk galt")
      console.error(error)
    },
  })
}
