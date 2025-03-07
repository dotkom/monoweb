import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../trpc"

export const useEditEventWithGroupsMutation = () => {
  const notification = useQueryNotification()

  return trpc.event.editWithGroups.useMutation({
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
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av arrangementet: ${err.toString()}.`,
      })
    },
  })
}
