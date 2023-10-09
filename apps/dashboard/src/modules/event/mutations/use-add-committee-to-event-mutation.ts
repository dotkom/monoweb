import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useAddCommitteeToEventMutation = () => {
  const utils = trpc.useContext()
  const notification = useQueryNotification()
  return trpc.event.committee.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Legger til komité...",
        message: `Legger til komiteen som arrangør av dette arrangementet.`,
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Komité lagt til",
        message: "Komiteen har blitt lagt til arrangørlisten.",
      })
      utils.event.committee.get.invalidate()
    },
  })
}
