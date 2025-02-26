import { useQueryNotification } from "src/app/notifications"
import { trpc } from "src/trpc"

export const useUpdateGroupMutation = () => {
  const notification = useQueryNotification()

  return trpc.group.update.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer",
        message: "Gruppen blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Oppdatert",
        message: `Gruppen "${data.name}" har blitt oppdatert.`,
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
