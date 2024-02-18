import { trpc } from "../../../utils/trpc"
import { useQueryNotification } from "../../../app/notifications"

export const useRemoveCompanyFromEventMutation = () => {
  const notification = useQueryNotification()
  return trpc.event.company.delete.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Fjerner bedrift",
        message: `Fjerner bedriften fra arrangørlisten til dette arrangementet.`,
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Bedrift fjernet",
        message: "Bedriften har blitt fjernet fra arrangørlisten.",
      })
    },
  })
}
