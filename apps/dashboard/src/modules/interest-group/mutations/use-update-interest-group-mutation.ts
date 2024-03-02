import { useQueryNotification } from "src/app/notifications"
import { trpc } from "src/utils/trpc"

export const useUpdateInterestGroupMutation = () => {
  const notification = useQueryNotification()

  return trpc.interestGroup.update.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer",
        message: "Ressursen blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Ressursen oppdatert",
        message: `Ressursen "${data.name}" har blitt oppdatert.`,
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
