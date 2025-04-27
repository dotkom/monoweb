import { useQueryNotification } from "@/notifications"
import { useTRPC } from "@/trpc"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useEditMarkMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.mark.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer prikk...",
          message: "Prikken blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Prikk oppdatert",
          message: `Prikk "${data.id}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.mark.get.queryOptions(data.id))
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av prikk: ${err.toString()}.`,
        })
      },
    })
  )
}
