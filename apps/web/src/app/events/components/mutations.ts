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

interface UseRegisterMutationInput {
  onSuccess: () => void
}

export const useRegisterMutation = ({ onSuccess }: UseRegisterMutationInput) => {
  const utils = trpc.useUtils()

  const mutation = trpc.event.attendance.registerForEvent.useMutation({
    onSuccess: () => {
      utils.event.getWebEventDetailData.invalidate()
      utils.event.attendance.getAttendee.invalidate()
      onSuccess()
    },
    onError: (error) => {
      console.error(error)
    },
  })

  return mutation
}

export const useSetExtrasChoicesMutation = () => {
  const utils = trpc.useUtils()

  return trpc.event.attendance.setExtrasChoices.useMutation({
    onSuccess: (data) => {
      alert(
        `Dine valg er lagret. Du har valgt:\n${data.extrasChoices
          .map((choice) => `${choice.questionName}: ${choice.choiceName}`)
          .join("\n")}`
      )
      utils.event.getWebEventDetailData.invalidate()
    },
    onError: (error) => {
      alert("Noe gikk galt")
      console.error(error)
    },
  })
}
