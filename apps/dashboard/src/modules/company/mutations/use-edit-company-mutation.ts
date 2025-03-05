import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../trpc"

export const useEditCompanyMutation = () => {
  const notification = useQueryNotification()

  return trpc.company.edit.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer bedrift...",
        message: "Bedriften blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Bedrift oppdatert",
        message: `Bedriften "${data.name}" har blitt oppdatert.`,
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av bedriften: ${err.toString()}.`,
      })
    },
  })
}
