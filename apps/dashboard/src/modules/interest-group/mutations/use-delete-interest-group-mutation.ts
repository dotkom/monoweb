import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../trpc"

export const useDeleteInterestGroupMutation = () => {
  const notification = useQueryNotification()

  return trpc.interestGroup.delete.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Sletter interessegrupper",
        message: "Interessegruppen slettes. Vennligst vent.",
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Interessegruppen er slettet",
        message: "Interessegruppen er fjernet fra systemet.",
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelsen: ${err.toString()}.`,
      })
    },
  })
}
