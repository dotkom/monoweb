import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useEditArticleMutation = () => {
  const notification = useQueryNotification()

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
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av artikkelen: ${err.toString()}.`,
      })
    },
  })
}
