import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useEditOfflineMutation = () => {
  const notification = useQueryNotification()
  const utils = trpc.useContext()
  return trpc.offline.edit.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer",
        message: "Ressursen blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Ressursen oppdatert",
        message: `Ressursen "${data.title}" har blitt oppdatert.`,
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering: ${err.toString()}.`,
      })
    },
  })
}
