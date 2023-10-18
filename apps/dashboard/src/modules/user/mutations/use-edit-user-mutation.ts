import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useEditUserMutation = () => {
  const notification = useQueryNotification()
  const utils = trpc.useContext()
  return trpc.user.edit.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer bruker...",
        message: "Brukeren blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Bruker oppdatert",
        message: `Bruker "${data.id}" har blitt oppdatert.`,
      })
      utils.user.all.invalidate()
      utils.user.get.invalidate()
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av bruker: ${err.toString()}.`,
      })
    },
  })
}
