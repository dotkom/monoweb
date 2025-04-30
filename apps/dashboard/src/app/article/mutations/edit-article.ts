import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc"
import { useMutation } from "@tanstack/react-query"

export const useEditArticleMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.article.edit.mutationOptions({
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
  )
}
