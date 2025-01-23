import { useQueryNotification } from "src/app/notifications"
import { trpc } from "src/trpc"

export const useUpdateInterestGroupMutation = () => {
  const notification = useQueryNotification()

  return trpc.interestGroup.update.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer",
        message: "Interessegruppern blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Oppdatert",
        message: `Interessegruppen "${data.name}" har blitt oppdatert.`,
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
