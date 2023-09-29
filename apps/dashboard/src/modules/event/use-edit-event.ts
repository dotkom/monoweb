import { useQueryNotification } from "../../app/notifications"
import { trpc } from "../../utils/trpc"

export const useEditEvent = () => {
  const notification = useQueryNotification()
  const utils = trpc.useContext()
  return trpc.event.edit.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer arrangement...",
        message: "Arrangementet blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Arrangement oppdatert",
        message: `Arrangementet "${data.title}" har blitt oppdatert.`,
      })
      utils.event.all.invalidate()
      utils.event.get.invalidate()
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av arrangementet: ${err.toString()}.`,
      })
    },
  })
}