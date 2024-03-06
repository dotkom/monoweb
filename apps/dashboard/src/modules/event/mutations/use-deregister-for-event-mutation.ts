import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useDeregisterForEventMutation = () => {
  const notification = useQueryNotification()

  return trpc.event.attendance.deregisterForEvent.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Melder av bruker",
        message: "Brukeren blir meldt av arrangementet.",
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Avmelding vellykket",
        message: "Bruker ble meldt av arrangementet.",
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under avmelding: ${err.toString()}.`,
      })
    },
  })
}
