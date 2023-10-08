import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useEditCompanyMutation = () => {
  const notification = useQueryNotification()
  const utils = trpc.useContext()
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
      utils.company.all.invalidate()
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av bedriften: ${err.toString()}.`,
      })
    },
  })
}
