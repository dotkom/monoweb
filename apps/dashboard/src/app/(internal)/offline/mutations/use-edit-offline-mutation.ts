import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useEditOfflineMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.offline.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer",
          message: "Ressursen blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Ressursen oppdatert",
          message: `Ressursen "${data.title}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.offline.get.queryOptions(data.id))
        await queryClient.invalidateQueries(trpc.offline.all.queryOptions())
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering: ${err.toString()}.`,
        })
      },
    })
  )
}
