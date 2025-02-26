import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../trpc"

export const useDeleteGroupMutation = () => {
  const notification = useQueryNotification()

  return trpc.group.delete.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Sletter gruppen",
        message: "Gruppen slettes. Vennligst vent.",
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Gruppen er slettet",
        message: "Gruppen er fjernet fra systemet.",
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under slettingen: ${err.toString()}.`,
      })
    },
  })
}
