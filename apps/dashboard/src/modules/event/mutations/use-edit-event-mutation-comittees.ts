import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useEditEventWithCommitteesMutation = () => {
  const notification = useQueryNotification()

  return trpc.event.editWithCommittees.useMutation({
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
