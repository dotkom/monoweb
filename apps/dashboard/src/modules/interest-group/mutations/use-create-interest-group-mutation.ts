import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useCreateInterestGroupMutation = () => {
  const notification = useQueryNotification()

  return trpc.interestGroup.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter interessegruppe...",
        message: "Interessegruppen blir opprettet.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Interessegruppen er opprettet",
        message: `Interessegruppen "${data.name}" har blitt oppdatert.`,
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
