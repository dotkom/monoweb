import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../trpc"

export const useCreateGroupMutation = () => {
  const notification = useQueryNotification()

  return trpc.group.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter gruppe...",
        message: "Gruppen blir opprettet.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Gruppen er opprettet",
        message: `Gruppen "${data.name}" har blitt oppdatert.`,
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
