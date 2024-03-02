import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useDeleteInterestGroupMutation = () => {
  const notification = useQueryNotification()

  return trpc.interestGroup.delete.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter interessegruppe...",
        message: "Interessegruppen blir opprettet.",
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Interessegruppen er opprettet",
        message: "Interessegruppen har blitt slettet.",
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
