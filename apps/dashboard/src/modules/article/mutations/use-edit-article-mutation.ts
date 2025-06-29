import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useEditArticleMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.article.editWithTags.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer artikkel...",
          message: "Artikkelen blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.article.get.queryOptions(data.id))
        await queryClient.invalidateQueries(trpc.article.all.queryOptions())
        await queryClient.invalidateQueries(trpc.article.getTags.queryOptions())

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
