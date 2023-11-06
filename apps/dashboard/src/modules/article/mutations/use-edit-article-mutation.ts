import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useEditArticleMutation = () => {
  const notification = useQueryNotification()
  const utils = trpc.useContext()
  return trpc.article.edit.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer artikkel...",
        message: "Artikkelen blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Artikkelen oppdatert",
        message: `Artikkelen "${data.title}" har blitt oppdatert.`,
      })
      utils.company.all.invalidate()
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av artikkelen: ${err.toString()}.`,
      })
    },
  })
}
