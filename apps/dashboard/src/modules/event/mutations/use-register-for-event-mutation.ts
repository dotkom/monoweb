import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useRegisterForEventMutation = () => {
  const notification = useQueryNotification()

  return trpc.event.attendance.registerForEvent.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Melder på bruker",
        message: "Brukeren blir meldt på arrangementet.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Påmelding vellykket",
        message: `Bruker ${data?.userId} ble påmeldt arrangementet.`,
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under påmelding: ${err.toString()}.`,
      })
    },
  })
}
