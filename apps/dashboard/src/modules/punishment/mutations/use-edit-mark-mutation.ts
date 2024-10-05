import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../trpc"

export const useEditMarkMutation = () => {
  const notification = useQueryNotification()
  return trpc.mark.edit.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer prikk...",
        message: "Prikken blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Prikk oppdatert",
        message: `Prikk "${data.id}" har blitt oppdatert.`,
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av prikk: ${err.toString()}.`,
      })
    },
  })
}
