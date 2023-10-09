import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useRemoveCommitteeFromEventMutation = () => {
  const utils = trpc.useContext()
  const notification = useQueryNotification()
  return trpc.event.committee.delete.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Fjerner komité",
        message: `Fjerner komiteen fra arrangørlisten til dette arrangementet.`,
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Komité fjernet",
        message: "Komiteen har blitt fjernet fra arrangørlisten.",
      })
      utils.event.committee.get.invalidate()
    },
  })
}
